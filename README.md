# Nipple Remote

## Introduction

This project allows you to control your videos on your computer remotely using your phone. The PWA to be accessed on your phone can be found at https://nipple-remote.netlify.app/home. 
It must be used in conjunction with the Firefox extension https://addons.mozilla.org/en-US/firefox/addon/nipple-remote/. Instructions for use can be found on the Firefox add-on. 

## Web RTC

This project is made for exploration into the WebRTC technology. By using WebRTC, the PWA on the phone is able to communicate directly with the browser extension (without communicating via a server).

## Brief explanation

This repository consists of three main folders:

1. 'extention' contains code related to the firefox add-on (Google extension does not support persisting background pages and hence cannot be used for this purpose)

2. 'frontend' contains code related to the frontend of the remote (the PWA)

3. 'signaling-server' contains code related to the server used for the initial signalling to establish a WebRTC connection between the extension and the frontend

Web sockets are used between the signaling-server and both the frontend and the extension to start a WebRTC connection between the frontend and the extension.

