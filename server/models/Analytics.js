import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
    page: { type: String, required: true, index: true }, // e.g., '/', '/app', '/app/builder/...'
    visitorId: { type: String, required: true, index: true }, // Hashed first-party visitor cookie; approximate unique visitor
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, index: true }, // Group page views into sessions
    isInternal: { type: Boolean, default: false, index: true }, // Authenticated application/editor traffic, separate from public traffic
}, { timestamps: true });

// Compound indexes for common queries
AnalyticsSchema.index({ timestamp: -1, page: 1 });
AnalyticsSchema.index({ timestamp: -1, visitorId: 1 });
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ isInternal: 1, timestamp: -1, userId: 1 });
AnalyticsSchema.index({ isInternal: 1, timestamp: -1, page: 1 });
AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

export default Analytics;
