/**
 * Volunteer Registration Form Handler
 * Handles form validation and submission
 */

// Form and message elements
const volunteerForm = document.getElementById('volunteerForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (basic format check)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s+\-()]+$/.test(phone) && phone.length >= 10;
    return phoneRegex;
}

/**
 * Hide all error messages
 */
function hideErrorMessages() {
    document.querySelectorAll('[id$="Error"]').forEach(el => {
        el.classList.add('hidden');
    });
}

/**
 * Validate form fields
 * @returns {boolean} - True if all fields are valid
 */
function validateForm() {
    hideErrorMessages();
    let isValid = true;

    // Get form values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const position = document.getElementById('position').value.trim();
    const availability = document.getElementById('availability').value;

    // Validate Name
    if (name === '') {
        document.getElementById('nameError').classList.remove('hidden');
        isValid = false;
    }

    // Validate Phone
    if (phone === '') {
        document.getElementById('phoneError').textContent = 'Phone number is required';
        document.getElementById('phoneError').classList.remove('hidden');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        document.getElementById('phoneError').textContent = 'Please enter a valid phone number';
        document.getElementById('phoneError').classList.remove('hidden');
        isValid = false;
    }

    // Validate Email
    if (email === '') {
        document.getElementById('emailError').textContent = 'Email is required';
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        document.getElementById('emailError').classList.remove('hidden');
        isValid = false;
    }

    // Validate Position
    if (position === '') {
        document.getElementById('positionError').classList.remove('hidden');
        isValid = false;
    }

    // Validate Availability
    if (availability === '') {
        document.getElementById('availabilityError').classList.remove('hidden');
        isValid = false;
    }

    return isValid;
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleSubmit(event) {
    event.preventDefault();

    // Clear previous messages
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Prepare form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        position: document.getElementById('position').value.trim(),
        experience: document.getElementById('experience').value.trim(),
        availability: document.getElementById('availability').value,
    };

    try {
        // Disable submit button during submission
        const submitButton = volunteerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Send data to backend
        const response = await fetch('http://localhost:5000/api/register-volunteer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Registration';

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Registration failed');
        }

        // Show success message
        successMessage.classList.remove('hidden');

        // Reset form
        volunteerForm.reset();

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Registration error:', error);
        errorText.textContent = error.message || 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

// Event Listeners
volunteerForm.addEventListener('submit', handleSubmit);

// Real-time validation (remove error on input)
document.getElementById('name').addEventListener('input', function () {
    if (this.value.trim() !== '') {
        document.getElementById('nameError').classList.add('hidden');
    }
});

document.getElementById('phone').addEventListener('input', function () {
    if (isValidPhone(this.value.trim())) {
        document.getElementById('phoneError').classList.add('hidden');
    }
});

document.getElementById('email').addEventListener('input', function () {
    if (isValidEmail(this.value.trim())) {
        document.getElementById('emailError').classList.add('hidden');
    }
});

document.getElementById('position').addEventListener('input', function () {
    if (this.value.trim() !== '') {
        document.getElementById('positionError').classList.add('hidden');
    }
});

document.getElementById('availability').addEventListener('change', function () {
    if (this.value !== '') {
        document.getElementById('availabilityError').classList.add('hidden');
    }
});

console.log('Volunteer registration form loaded successfully');
