pwmanager - A drop-dead simple passwordmanager running on the commandline
=========================================================================

This is a command line password manager that stores your passwords in a file, which you 
can put on your shared storage if you like.

Passwords are stored in a JSON file that and are encrypted using AES-256-CBC. The description
on how to decrypt your passwords is included in the json-file, so whereever you are, even if
you dont have this tool you will get your passwords (if you know your master password).

This tool allows you to

* generate passwords
* store passwords
* read passwords
* store / read passwords to/from the clipboard (currently on osx only)
* sync passwords between different instances of this application (see --server and --synchronize)

New: An simple clientside webapp is included to read your passwords from a password file, if you cannot
run ruby or this program on a machine. The webapp uses CryptoJS, JQuery and Underscore.js to do its job.

I will of course not guarantee that this tool provides any security. I'm not a security expert. Have
a look at the source yourself and see if it meets your security needs. (Don't worry it's only ~400 LOC)

Installation
------------

OS X / Linux
------------

You'll need a unix (preferrably an OS X), a current ruby (I use 2.0.0) and a terminal

* download the tool
* chmod +x pwmanager
* ./pwmanager
* (You might want to move it to /usr/local/bin or some place else)


Windows
-------

* Download ruby using [RubyInstaller for Windows](http://rubyinstaller.org/) and install it. Make sure
  to put it in your path and enable .rb detection (using the corresponding checkmarks in the installer)
* Download the tool
* Open your Command Line Tool
* Just run it (either by typing `ruby pwmanager` or by renaming it to pwmanager.rb and running it using `pwmanger.rb`)
