# TicoAutos - Frontend Client

## Course Information
* **Course:** Web Environment Programming II (ISW-711)
* **Institution:** Universidad Técnica Nacional (UTN)
* **Student:** Alvaro Victor Zamora

## Introduction
This is the client-side application for the TicoAutos marketplace. Built with **Angular 17+ (Standalone)**, it consumes the TicoAutos REST API to provide a seamless vehicle buying and selling experience.

## Frontend Architecture
Following professional standards, the project is organized into layers:
* **Core:** Global services, JWT interceptors, and authentication guards.
* **Features:** Independent functional modules (Auth, Vehicles, Messaging).
* **Shared:** Reusable UI components and utilities.

## Tech Stack
* **Framework:** Angular (Standalone Components).
* **Styling:** SCSS / Tailwind.
* **State Management:** RxJS Observables.
* **Security:** JWT Authentication via HTTP Interceptors.

## Setup
1. Clone the repo: `git clone [url-del-repo]`
2. Install dependencies: `npm install`
3. Run dev server: `ng serve`