#!/usr/bin/env perl
use strict;
use warnings;

# Block Comment Script - Comments out import/export statements
# Usage: perl blkc.pl file1.js file2.js ...

if (@ARGV == 0) {
    print STDERR "Usage: $0 file1.js [file2.js ...]\n";
    exit 1;
}

for my $file (@ARGV) {
    if (!-f $file) {
        print STDERR "Warning: File '$file' not found, skipping.\n";
        next;
    }

    # Read entire file
    local $/;
    open my $fh, '<', $file or die "Cannot open $file: $!";
    my $content = <$fh>;
    close $fh;

    # Apply block comment transformations
    $content =~ s#^(import\s+[\s\S]*?;)$#/* $1 */#gm;
    $content =~ s#^(export\s+(?:const|let|var|function|class)\s+\w+[\s\S]*?[;}])$#/* $1 */#gm;
    $content =~ s#^(export\s+\{[\s\S]*?\}\s*;?)$#/* $1 */#gm;

    # Write back to file
    open $fh, '>', $file or die "Cannot write to $file: $!";
    print $fh $content;
    close $fh;

    print "Commented: $file\n";
}
