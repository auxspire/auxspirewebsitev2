// Client Portal Ticket Submission Form Handler

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ticket-submission-form');
    const submitBtn = document.getElementById('submit-ticket-btn');
    const messagesDiv = document.getElementById('form-messages');
    
    if (!form) return;
    
    // Form validation
    function validateForm() {
        const name = document.getElementById('ticket-name').value.trim();
        const email = document.getElementById('ticket-email').value.trim();
        const subject = document.getElementById('ticket-subject').value.trim();
        const priority = document.getElementById('ticket-priority').value;
        const category = document.getElementById('ticket-category').value;
        const description = document.getElementById('ticket-description').value.trim();
        const consent = document.getElementById('ticket-consent').checked;
        
        // Clear previous messages
        messagesDiv.className = '';
        messagesDiv.style.display = 'none';
        messagesDiv.innerHTML = '';
        
        // Validation checks
        if (!name) {
            showError('Please enter your name.');
            return false;
        }
        
        if (!email) {
            showError('Please enter your email address.');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address.');
            return false;
        }
        
        if (!subject) {
            showError('Please enter a ticket subject.');
            return false;
        }
        
        if (!priority) {
            showError('Please select a priority level.');
            return false;
        }
        
        if (!category) {
            showError('Please select a category.');
            return false;
        }
        
        if (!description) {
            showError('Please provide a description of your issue.');
            return false;
        }
        
        if (description.length < 10) {
            showError('Description must be at least 10 characters long.');
            return false;
        }
        
        if (!consent) {
            showError('Please agree to the terms and conditions.');
            return false;
        }
        
        // File validation
        const fileInput = document.getElementById('ticket-attachments');
        if (fileInput.files.length > 0) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ['application/pdf', 'application/msword', 
                                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                 'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                
                if (file.size > maxSize) {
                    showError(`File "${file.name}" exceeds the maximum size of 10MB.`);
                    return false;
                }
                
                if (!allowedTypes.includes(file.type)) {
                    showError(`File "${file.name}" is not an allowed file type.`);
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Show error message
    function showError(message) {
        messagesDiv.className = 'error';
        messagesDiv.style.display = 'block';
        messagesDiv.innerHTML = '<strong>Error:</strong> ' + message;
        messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Show success message
    function showSuccess(message) {
        messagesDiv.className = 'success';
        messagesDiv.style.display = 'block';
        messagesDiv.innerHTML = '<strong>Success:</strong> ' + message;
        messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.value = 'Submitting...';
        
        // Collect form data
        const formData = new FormData(form);
        
        // NOTE: Ticket submissions should be sent to your backend API endpoint
        // Recommended: Set up an API endpoint (e.g., /api/tickets/submit) that:
        // 1. Receives the form data
        // 2. Validates and stores the ticket in your ticketing system (e.g., Salesforce Service Cloud, Zendesk, Jira Service Desk)
        // 3. Sends confirmation email to the client
        // 4. Notifies your support team
        
        // For now, simulate form submission
        setTimeout(function() {
            // Simulate API call
            console.log('Ticket submission data:', {
                name: formData.get('client-name'),
                email: formData.get('client-email'),
                subject: formData.get('ticket-subject'),
                priority: formData.get('ticket-priority'),
                category: formData.get('ticket-category'),
                description: formData.get('ticket-description'),
                attachments: formData.getAll('ticket-attachments[]')
            });
            
            // Show success message
            showSuccess('Your ticket has been submitted successfully! Ticket ID: #' + Math.floor(Math.random() * 10000) + '. Our team will respond within 24 hours.');
            
            // Reset form
            form.reset();
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.value = 'Submit Ticket';
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            /* 
            // When backend is ready, use this code instead:
            // Replace '/api/tickets/submit' with your actual API endpoint
            fetch('/api/tickets/submit', {
                method: 'POST',
                body: formData,
                headers: {
                    // Add any required headers (e.g., authentication tokens)
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccess('Your ticket has been submitted successfully! Ticket ID: #' + data.ticketId + '. Our team will respond within 24 hours.');
                    form.reset();
                } else {
                    showError(data.message || 'An error occurred. Please try again.');
                }
                submitBtn.disabled = false;
                submitBtn.value = 'Submit Ticket';
            })
            .catch(error => {
                showError('Network error. Please check your connection and try again.');
                submitBtn.disabled = false;
                submitBtn.value = 'Submit Ticket';
            });
            */
        }, 1500);
    });
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.hasAttribute('required')) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                this.style.borderColor = '#ddd';
            }
        });
    });
});
