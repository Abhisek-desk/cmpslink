# Core API

## Auth
POST /api/auth/register
POST /api/auth/login

## Students
GET /api/students/me
PUT /api/students/me
GET /api/students

## Jobs
GET /api/jobs
POST /api/jobs

## Matching
GET /api/matching/job/:jobId

## Drives
GET /api/drives
POST /api/drives
GET /api/drives/conflicts

## Offers
GET /api/offers
POST /api/offers
PUT /api/offers/:id

## Analytics
GET /api/analytics/dashboard

## AI
POST /api/ai/readiness
