/**
 * Generates a report of Google Meet unique meetings, duration, and participants.
 * 
 * Prerequisites:
 * 1. Enable "Admin SDK API" in the Google Cloud Console for this Apps Script project.
 * 2. Ensure "AdminReports" is enabled in "Services" (already added to appsscript.json).
 * 3. The user running this must be a Google Workspace Admin with Reports API privileges.
 */
function generateUniqueMeetStats() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Optional: Create a new sheet if preferred
  // var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Meet Stats " + new Date().toISOString().slice(0,10));
  
  sheet.clear();
  sheet.appendRow(["Date", "Conference ID", "Meeting Code", "Duration (Minutes)", "Participant Count", "Participants"]);
  sheet.getRange("A1:F1").setFontWeight("bold");

  // Configuration
  var lookbackDays = 30; // Adjust as needed
  var now = new Date();
  var startTime = new Date(now.getTime() - (lookbackDays * 24 * 60 * 60 * 1000)).toISOString();
  
  // Data storage: { conferenceId: { startTime: Date, endTime: Date, participants: Set<String>, meetingCode: String } }
  var meetings = {};

  var pageToken;
  do {
    // Fetch Meet activities
    // See: https://developers.google.com/admin-sdk/reports/v1/reference/activities/list
    try {
      var response = AdminReports.Activities.list('all', 'meet', {
        maxResults: 1000,
        pageToken: pageToken,
        startTime: startTime
      });
    } catch (e) {
      Logger.log("Error fetching reports: " + e.message);
      Browser.msgBox("Error: " + e.message + "\nEnsure Admin SDK is enabled in GCP Console.");
      return;
    }

    var items = response.items;
    if (items && items.length > 0) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var eventTime = new Date(item.id.time);
        var actorEmail = item.actor.email;
        
        // Extract event parameters
        var conferenceId = null;
        var meetingCode = null;
        var durationSeconds = 0;
        
        if (item.events && item.events.length > 0) {
          for (var j = 0; j < item.events.length; j++) {
            var event = item.events[j];
            // We focus on 'call' events (call_started, call_ended, etc usually grouped under 'call' or distinct events)
            // The API typically returns event.name = 'call' or specific like 'call_ended' depending on API version/filters.
            // In Reports API v1, type is 'meet', event name often 'call'.
            
            if (event.parameters) {
              for (var k = 0; k < event.parameters.length; k++) {
                var param = event.parameters[k];
                if (param.name === 'conference_id') conferenceId = param.value;
                if (param.name === 'meeting_code') meetingCode = param.value;
                if (param.name === 'duration_seconds') durationSeconds = parseInt(param.intValue, 10);
              }
            }
          }
        }

        if (conferenceId) {
          if (!meetings[conferenceId]) {
            meetings[conferenceId] = {
              minTime: eventTime,
              maxTime: eventTime,
              participants: {}, // Using object as Set
              meetingCode: meetingCode || ""
            };
          }
          
          // Update Aggregates
          var m = meetings[conferenceId];
          if (eventTime < m.minTime) m.minTime = eventTime;
          if (eventTime > m.maxTime) m.maxTime = eventTime;
          if (meetingCode && !m.meetingCode) m.meetingCode = meetingCode;
          
          // Add participant
          if (actorEmail) {
            m.participants[actorEmail] = true;
          }
        }
      }
    }
    pageToken = response.nextPageToken;
  } while (pageToken);

  // Output to Sheet
  var rows = [];
  for (var confId in meetings) {
    var m = meetings[confId];
    
    // Calculate Duration
    // Method 1: Wall clock time (First event to Last event)
    // Note: This is approximate. If a meeting has large gaps, it counts the gap.
    // For more precision, one would sum overlapping intervals, but this is usually sufficient for "meeting length".
    var durationMs = m.maxTime - m.minTime;
    var durationMins = (durationMs / (1000 * 60)).toFixed(2);
    
    // Method 2: If we wanted total participant-minutes, we would sum durationSeconds from 'call_ended' events.
    // The user asked for "their duration", implying the meeting's length.

    var participantList = Object.keys(m.participants).sort().join(", ");
    var participantCount = Object.keys(m.participants).length;

    rows.push([
      m.minTime, // Date/Time
      confId,
      m.meetingCode,
      durationMins,
      participantCount,
      participantList
    ]);
  }

  // Bulk write for performance
  if (rows.length > 0) {
    // Sort by date descending
    rows.sort(function(a, b) { return b[0] - a[0]; });
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  Logger.log("Processed " + rows.length + " unique meetings.");
}
