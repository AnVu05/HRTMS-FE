export const dashboardStats = {
  totalTournaments: 12,
  activeRaces: 5,
  pendingVerifications: 8,
  pendingRegistrations: 15,
  newUsers: 124,
};

export const mockTournaments = [
  { id: 1, name: "Summer Derby 2026", status: "PUBLISHED", startDate: "2026-06-01", endDate: "2026-08-31", location: "Grand Turf Club", publishedDate: "2026-05-15", openPredictionDate: "2026-05-20", closePredictionDate: "2026-05-30" },
  { id: 2, name: "Autumn Classic", status: "DRAFT", startDate: "2026-09-15", endDate: "2026-11-20", location: "Royal Raceway", publishedDate: "", openPredictionDate: "", closePredictionDate: "" },
  { id: 3, name: "Spring Sprint", status: "COMPLETE", startDate: "2026-03-10", endDate: "2026-05-15", location: "Valley Track", publishedDate: "2026-02-10", openPredictionDate: "2026-02-15", closePredictionDate: "2026-03-01" },
];

export const mockVerifications = [
  { id: 1, jockeyId: 101, jockeyName: "John Doe", status: "PENDING", submittedDate: "2026-07-08", certImageUrl: "https://via.placeholder.com/150" },
  { id: 2, jockeyId: 105, jockeyName: "Michael Smith", status: "PENDING", submittedDate: "2026-07-09", certImageUrl: "https://via.placeholder.com/150" },
];

export const mockRegistrations = [
  { id: 1, userId: 201, userName: "Sarah Connor", roleRequested: "DOCTOR", status: "PENDING", submittedDate: "2026-07-07" },
  { id: 2, userId: 202, userName: "James Bond", roleRequested: "REFEREE", status: "PENDING", submittedDate: "2026-07-08" },
];

export const mockUsers = [
  { id: 101, name: "John Doe", username: "johndoe", email: "john@example.com", password: "password123", role: "JOCKEY", status: "ACTIVE" },
  { id: 102, name: "Jane Smith", username: "janesmith", email: "jane@example.com", password: "securepass456", role: "ADMIN", status: "ACTIVE" },
  { id: 103, name: "Alice Doctor", username: "alicedoc", email: "alice@example.com", password: "docpassword789", role: "DOCTOR", status: "ACTIVE" },
  { id: 104, name: "Bob Referee", username: "bobref", email: "bob@example.com", password: "refpassword012", role: "REFEREE", status: "INACTIVE" },
  { id: 201, name: "Sarah Connor", username: "sarahc", email: "sarah@example.com", password: "sarahpassword", role: "SPECTATOR", status: "INACTIVE" },
];

export const mockRaceFormats = [
  { 
    id: 1, 
    name: "Sprint 1000m", 
    description: "Short distance fast race",
    entryFee: 100,
    firstPrizePercent: 50,
    secondPrizePercent: 30,
    thirdPrizePercent: 20,
    allowedBreed: "Thoroughbred",
    allowedHorseAge: "3-5",
    minJockeyExperience: 2,
    minWeight: 50,
    maxWeight: 60,
    baseWeight: 55,
    applyFemaleAllowance: 1.5,
    status: "ACTIVE"
  },
  { 
    id: 2, 
    name: "Endurance 3000m", 
    description: "Long distance stamina race",
    entryFee: 200,
    firstPrizePercent: 60,
    secondPrizePercent: 25,
    thirdPrizePercent: 15,
    allowedBreed: "Arabian",
    allowedHorseAge: "4-8",
    minJockeyExperience: 5,
    minWeight: 55,
    maxWeight: 65,
    baseWeight: 60,
    applyFemaleAllowance: 2.0,
    status: "ACTIVE"
  },
  { 
    id: 3, 
    name: "Derby 2000m", 
    description: "Medium distance race",
    entryFee: 150,
    firstPrizePercent: 55,
    secondPrizePercent: 25,
    thirdPrizePercent: 20,
    allowedBreed: "Quarter",
    allowedHorseAge: "3-6",
    minJockeyExperience: 3,
    minWeight: 52,
    maxWeight: 62,
    baseWeight: 58,
    applyFemaleAllowance: 1.0,
    status: "INACTIVE"
  },
  { 
    id: 4, 
    name: "Cancelled Sprint", 
    description: "Old deleted race format",
    entryFee: 50,
    firstPrizePercent: 50,
    secondPrizePercent: 30,
    thirdPrizePercent: 20,
    allowedBreed: "Appaloosa",
    allowedHorseAge: "2-4",
    minJockeyExperience: 1,
    minWeight: 50,
    maxWeight: 60,
    baseWeight: 55,
    applyFemaleAllowance: 0,
    status: "DELETE"
  },
];
export const mockReferees = [
  { id: 301, name: "Thomas Wayne" },
  { id: 302, name: "Arthur Shelby" },
  { id: 303, name: "Michael Corleone" },
];

export const mockRaces = {
  1: [
    { id: 1, name: "Opening Sprint", date: "2026-06-01", time: "10:00", distance: 1200, prizePool: 50000, status: "COMPLETED" },
    { id: 2, name: "Midday Classic", date: "2026-06-01", time: "13:00", distance: 1600, prizePool: 75000, status: "COMPLETED" },
    { id: 3, name: "Sunset Derby", date: "2026-06-02", time: "16:30", distance: 2400, prizePool: 150000, status: "ACTIVE" },
    { id: 4, name: "Grand Finale", date: "2026-06-05", time: "15:00", distance: 3200, prizePool: 225000, status: "UPCOMING" },
  ],
  2: [
    { id: 5, name: "Qualifier 1", date: "2026-09-15", time: "09:00", distance: 1000, prizePool: 20000, status: "UPCOMING" },
    { id: 6, name: "Qualifier 2", date: "2026-09-16", time: "09:00", distance: 1000, prizePool: 20000, status: "UPCOMING" },
  ],
};

export const mockDoctors = [
  { id: 401, username: "dr.smith" },
  { id: 402, username: "dr.tran" },
  { id: 403, username: "dr.jones" }
];

export const mockMedicalRegistrations = [
  { id: 10, tournamentName: "Hanoi Grand Prix", raceName: "Sunset Derby", ownerName: "John Wick", doctorUsername: null, status: "PREPARE" },
  { id: 11, tournamentName: "Hanoi Grand Prix", raceName: "Opening Sprint", ownerName: "Bruce Wayne", doctorUsername: "dr.smith", status: "ACCEPT" },
  { id: 12, tournamentName: "Saigon Cup", raceName: "Qualifier 1", ownerName: "Clark Kent", doctorUsername: null, status: "PREPARE" },
  { id: 13, tournamentName: "Saigon Cup", raceName: "Qualifier 2", ownerName: "Diana Prince", doctorUsername: null, status: "PENDING_DOCTOR" },
  { id: 14, tournamentName: "Hanoi Grand Prix", raceName: "Grand Finale", ownerName: "Arthur Curry", doctorUsername: null, status: "PREPARE" },
];
export const mockNotifications = [
  { id: 1, title: "New Jockey Certificate", message: "Jockey John Doe has submitted a certificate for verification.", time: "10 minutes ago", read: false },
  { id: 2, title: "System Update", message: "Server maintenance scheduled for tonight at 2 AM.", time: "2 hours ago", read: true },
  { id: 3, title: "New Registration", message: "Sarah Connor applied for DOCTOR role.", time: "1 day ago", read: false },
];
