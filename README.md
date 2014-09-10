# E-Mail followup-Zimlet for Zimbra Collaboration Server 8.5

## Introduction

This zimlet (and the associated server extension and agent) provide the 
functionality to create followup E-Mails for the Zimbra Collaboration Server 
versions 8.5 and up.

## Components

### Zimlet

The zimlet provides the basic user interface, that lets users create followup
 emails at different points of time. It moves the mails into the 
 followup-folder.
 
It relies on the server extension to set the date on followup emails.
 
### Server extension

The server extension provides a SOAP request to set the date on a specific 
mail. 
 
### Agent

The agent is a Python script, that looks periodically for E-Mails that are due
 to followup, moves that mails back into the inbox, flags them as "unread" 
 and tags them.

## Warning

When a followup e-mail is due, the mail moves back into the inbox folder. To 
make the e-mail visible to the user, it moves to the top of the inbox. To 
achieve this, the receive date of that mail is modified inside the Zimbra 
store.
  
The original received date of the e-mail as included in the e-mail's header 
is not modified.

If this goes against your company's compliance is up to you.

## Installation

### Zimlet

The zimlet may be installed as usual, either using the Zimbra Administration 
Console or the zmzimletctl tool.

### Server extension

Create the directory "de.dieploegers.followup" in "/opt/zimbra/lib/ext" under
 the root user and copy the jar file there. Restart the mailbox daemon to 
 activate the extension.
 
### Agent

Copy the files into some directory on your zimbra server. Also, 
install the python-zimbra library using

pip install python-zimbra

## Building

### Server extension

To build the server extension, create a file "build.properties" and configure
 the properties included in build_dist.properties to your liking.
 
Run "ant" to just build the extension's jar-file.

Use "ant deployrestart" to also deploy the jar file to your zimbra server and
 restart the mailbox daemon. (Leave out "restart" if you don't want to restart)