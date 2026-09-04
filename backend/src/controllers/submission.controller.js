const prisma = require('../config/prisma');

/**
 * Submit Form (Customer Protected Route)
 * Validates fields, checks unique email, records userCreated and dateCreated
 */
const createSubmission = async (req, res) => {
  try {
    const { firstName, lastName, email, gender, mobileNumber, address, feedback } = req.body;

    // Check if email already exists in submissions
    const existingSubmission = await prisma.submission.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: 'A submission with this email address already exists. Each submission email must be unique.',
      });
    }

    // Create submission record with audit fields
    const submission = await prisma.submission.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        gender: gender.toUpperCase().trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim(),
        feedback: feedback ? feedback.trim() : null,
        userCreated: req.user.email,
        dateCreated: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Application form submitted successfully.',
      submission,
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving submission.',
    });
  }
};

/**
 * Get submissions created by the currently logged-in customer
 */
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userCreated: req.user.email },
      orderBy: { dateCreated: 'desc' },
    });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching your submissions.',
    });
  }
};

/**
 * Get All Submissions (Admin Protected Route)
 * Supports gender filter and case-insensitive search by firstName or lastName
 */
const getAllSubmissions = async (req, res) => {
  try {
    const { gender, search } = req.query;

    const where = {};

    // Filter by gender if provided
    if (gender && gender !== 'ALL') {
      where.gender = gender.toUpperCase();
    }

    // Search by first name or last name (case-insensitive partial match)
    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
      ];
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { dateCreated: 'desc' },
    });

    // Provide quick counts for admin overview metrics
    const totalCount = await prisma.submission.count();
    const maleCount = await prisma.submission.count({ where: { gender: 'MALE' } });
    const femaleCount = await prisma.submission.count({ where: { gender: 'FEMALE' } });
    const otherCount = await prisma.submission.count({ where: { gender: 'OTHER' } });

    return res.status(200).json({
      success: true,
      submissions,
      stats: {
        total: totalCount,
        male: maleCount,
        female: femaleCount,
        other: otherCount,
      },
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving submissions.',
    });
  }
};

/**
 * Update a Submission (Admin Protected Route)
 * Can update any field, validates email uniqueness if changed, records userModified and dateModified
 */
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, gender, mobileNumber, address, feedback } = req.body;

    // Verify submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found with the provided ID.',
      });
    }

    // If updating email, ensure it's not taken by another submission
    if (email && email.toLowerCase() !== existingSubmission.email.toLowerCase()) {
      const emailConflict = await prisma.submission.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'Another submission already exists with this email address.',
        });
      }
    }

    const updateData = {
      userModified: req.user.email,
      dateModified: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (gender !== undefined) updateData.gender = gender.toUpperCase().trim();
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (feedback !== undefined) updateData.feedback = feedback ? feedback.trim() : null;

    const updated = await prisma.submission.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Submission updated successfully.',
      submission: updated,
    });
  } catch (error) {
    console.error('Update submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating submission.',
    });
  }
};

/**
 * Delete a Submission (Admin Protected Route)
 */
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found with the provided ID.',
      });
    }

    await prisma.submission.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Submission deleted successfully.',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting submission.',
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
};
