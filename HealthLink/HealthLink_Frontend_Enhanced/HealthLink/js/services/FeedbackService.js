/* ============================================================
   HEALTHLINK — FEEDBACK SERVICE (INTEGRATED)
   Business logic for submitting and managing feedback/reviews.
============================================================ */

import * as api from '../repositories/apiRepository.js';

const FeedbackService = (() => {

  /**
   * Submit a new patient review.
   */
  async function submitReview(patientId, content, rating) {
    if (!rating) {
      throw new Error('Please select a rating first');
    }
    if (!content || !content.trim()) {
      throw new Error('Please write a review');
    }

    const doctorId =
      document.getElementById("feedback-target")?.value;

    const feedback = {
      patient: { id: patientId },
      doctor: doctorId && doctorId !== "General"
        ? { id: parseInt(doctorId) }
        : null,
      content: content.trim(),
      rating: rating
    };
    return await api.submitFeedback(feedback);
  }

  /**
   * Get all feedback for admin.
   */
  async function getAllFeedback() {
    return await api.getAllFeedback();
  }

  return { submitReview, getAllFeedback };
})();

export default FeedbackService;
window.FeedbackService = FeedbackService;
