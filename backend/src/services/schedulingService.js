function minutes(time) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return h * 60 + m;
}

export function overlap(a, b) {
  return a.date.toISOString().slice(0, 10) === b.date.toISOString().slice(0, 10) &&
    minutes(a.startTime) < minutes(b.endTime) &&
    minutes(b.startTime) < minutes(a.endTime);
}

export function findConflicts(drives) {
  const conflicts = [];
  for (let i = 0; i < drives.length; i++) {
    for (let j = i + 1; j < drives.length; j++) {
      if (overlap(drives[i], drives[j])) {
        conflicts.push({ driveA: drives[i], driveB: drives[j], reason: "Overlapping date/time slot" });
      }
      if (drives[i].venue && drives[i].venue === drives[j].venue && overlap(drives[i], drives[j])) {
        conflicts.push({ driveA: drives[i], driveB: drives[j], reason: "Venue double-booking" });
      }
    }
  }
  return conflicts;
}
