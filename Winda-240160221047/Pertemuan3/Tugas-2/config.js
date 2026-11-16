export const getConfig = () => ({
    appName: process.env.APP_NAME || "API Sederhana Tugas 2",
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3003,
    courseCode: process.env.COURSE_CODE || "CPMK115"
});