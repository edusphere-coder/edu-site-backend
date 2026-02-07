const { sendContactEmail } = require('../utils/email');

/**
 * Handle contact form submission
 */
const submitContactForm = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, message } = req.body;
        console.log('Contact form request received:', { firstName, lastName, email });

        // Send email
        await sendContactEmail({
            firstName,
            lastName,
            email,
            phone,
            message
        });

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.'
        });
    } catch (error) {
        console.error('Contact form error:', error);

        // Check if it's an email configuration error
        if (error.code === 'EAUTH' || error.code === 'ESOCKET') {
            return res.status(500).json({
                success: false,
                message: 'Email service is currently unavailable. Please try again later or contact us directly at recruitment@eduspherecourses.com'
            });
        }

        next(error);
    }
};

module.exports = {
    submitContactForm
};
