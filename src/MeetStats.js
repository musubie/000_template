/**
 * @fileoverview Legacy Meet stats generator
 * Generates a report of Google Meet unique meetings, duration, and participants.
 * Note: This is a legacy file. Prefer using the modular functions in main.js.
 *
 * Prerequisites:
 * 1. Enable "Admin SDK API" in the Google Cloud Console for this Apps Script project.
 * 2. Ensure "AdminReports" is enabled in "Services".
 * 3. The user running this must be a Google Workspace Admin with Reports API privileges.
 */

/**
 * Generates unique Meet stats report (legacy function)
 * @returns {Object} Result with success status
 */
function generateUniqueMeetStats() {
  const spreadsheetId = Config.get("SPREADSHEET_IDS").CALENDAR_ANALYSIS;
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getActiveSheet();

  sheet.clear();
  sheet.appendRow(["Date", "Conference ID", "Meeting Code", "Duration (Minutes)", "Participant Count", "Participants"]);
  sheet.getRange("A1:F1").setFontWeight("bold");

  // Configuration
  const lookbackDays = Config.get("LOOKBACK_DAYS");
  const now = new Date();
  const startTime = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  // Data storage: { conferenceId: { startTime: Date, endTime: Date, participants: {}, meetingCode: String } }
  const meetings = {};

  let pageToken;
  do {
    let response;
    try {
      response = AdminReports.Activities.list("all", "meet", {
        maxResults: 1000,
        pageToken: pageToken,
        startTime: startTime,
      });
    } catch (e) {
      Logger.log(`Error fetching reports: ${e.message}`);
      return { success: false, error: e.message };
    }

    const items = response.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const eventTime = new Date(item.id.time);
        const actorEmail = item.actor.email;

        // Extract event parameters
        let conferenceId = null;
        let meetingCode = null;

        if (item.events && item.events.length > 0) {
          for (let j = 0; j < item.events.length; j++) {
            const event = item.events[j];

            if (event.parameters) {
              for (let k = 0; k < event.parameters.length; k++) {
                const param = event.parameters[k];
                if (param.name === "conference_id") conferenceId = param.value;
                if (param.name === "meeting_code") meetingCode = param.value;
              }
            }
          }
        }

        if (conferenceId) {
          if (!meetings[conferenceId]) {
            meetings[conferenceId] = {
              minTime: eventTime,
              maxTime: eventTime,
              participants: {},
              meetingCode: meetingCode || "",
            };
          }

          // Update Aggregates
          const m = meetings[conferenceId];
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
  const rows = [];
  for (const confId in meetings) {
    const m = meetings[confId];

    // Calculate Duration (wall clock time)
    const durationMs = m.maxTime - m.minTime;
    const durationMins = (durationMs / (1000 * 60)).toFixed(2);

    const participantList = Object.keys(m.participants).sort().join(", ");
    const participantCount = Object.keys(m.participants).length;

    rows.push([m.minTime, confId, m.meetingCode, durationMins, participantCount, participantList]);
  }

  // Bulk write for performance
  if (rows.length > 0) {
    // Sort by date descending
    rows.sort((a, b) => b[0] - a[0]);
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }

  Logger.log(`Processed ${rows.length} unique meetings.`);
  return { success: true, count: rows.length };
}
