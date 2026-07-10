// booking-handler.js - Centralized booking functionality for all pages

const BookingHandler = {
    // Initialize booking buttons on any page
    initBookingButtons: function() {
        // Handle the main "Book Now" button in header
        const quickBookBtn = document.getElementById('quickBookBtn');
        if (quickBookBtn) {
            quickBookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.redirectToBooking();
            });
        }
        
        // Handle any "Book This Safari" buttons (event delegation for dynamic content)
        document.body.addEventListener('click', (e) => {
            const bookBtn = e.target.closest('.btn-book-now, .btn-book-safari');
            if (bookBtn && bookBtn.getAttribute('data-booking') !== 'false') {
                e.preventDefault();
                const packageSlug = bookBtn.getAttribute('data-package-slug');
                const packageName = bookBtn.getAttribute('data-package-name');
                this.redirectToBooking(packageSlug, packageName);
            }
        });
        
        // Handle destination plan buttons
        document.body.addEventListener('click', (e) => {
            const planBtn = e.target.closest('.btn-plan-visit, .btn-book-destination');
            if (planBtn) {
                e.preventDefault();
                const destinationName = planBtn.getAttribute('data-destination');
                this.redirectToBooking(null, null, destinationName);
            }
        });
    },
    
    // Redirect to booking page with optional parameters
    redirectToBooking: function(packageSlug = null, packageName = null, destinationName = null) {
        let url = '/booking';
        const params = new URLSearchParams();
        
        if (packageSlug) {
            params.append('package', packageSlug);
        }
        if (packageName) {
            params.append('name', packageName);
        }
        if (destinationName) {
            params.append('destination', destinationName);
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += '?' + queryString;
        }
        
        window.location.href = url;
    },
    
    // Pre-fill booking form based on URL parameters
    preFillBookingForm: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const packageSlug = urlParams.get('package');
        const packageName = urlParams.get('name');
        const destinationName = urlParams.get('destination');
        
        // Wait for packages to load
        setTimeout(() => {
            // Pre-select package if provided
            if (packageSlug && window.availablePackages) {
                const packageSelect = document.getElementById('packageId');
                if (packageSelect) {
                    const matchedPackage = window.availablePackages.find(pkg => pkg.package_slug === packageSlug);
                    if (matchedPackage) {
                        packageSelect.value = matchedPackage.package_id;
                        
                        // Auto-calculate end date
                        const startDateInput = document.getElementById('startDate');
                        const endDateInput = document.getElementById('endDate');
                        if (startDateInput && endDateInput && matchedPackage.duration_days) {
                            startDateInput.addEventListener('change', function onStartDateChange() {
                                if (startDateInput.value) {
                                    const start = new Date(startDateInput.value);
                                    const end = new Date(start);
                                    end.setDate(start.getDate() + matchedPackage.duration_days);
                                    endDateInput.value = end.toISOString().split('T')[0];
                                }
                                startDateInput.removeEventListener('change', onStartDateChange);
                            });
                        }
                        
                        this.showNotification(`✓ ${matchedPackage.package_name} selected`, 'success');
                    }
                }
            }
            
            // Pre-fill special requests with destination info
            if (destinationName) {
                const specialRequests = document.getElementById('specialRequests');
                if (specialRequests && !specialRequests.value) {
                    specialRequests.value = `I'm interested in visiting ${destinationName}. Please provide more information about safari packages in this area.`;
                    this.showNotification(`Destination: ${destinationName} added to your request`, 'info');
                }
            }
            
            // Pre-fill special requests with package name if no destination
            if (packageName && !destinationName) {
                const specialRequests = document.getElementById('specialRequests');
                if (specialRequests && !specialRequests.value) {
                    specialRequests.value = `I'm interested in booking the ${packageName} safari package. Please send me more details and availability.`;
                }
            }
        }, 500);
    },
    
    // Map booking source to valid database values
    mapBookingSource: function(source) {
        const sourceMapping = {
            'Google': 'Website',
            'Social Media': 'Social Media',
            'Friend/Family': 'Referral',
            'Travel Agent': 'Travel Agent',
            'Blog/Article': 'Blog',
            'Other': 'Other'
        };
        
        if (source && sourceMapping[source]) {
            return sourceMapping[source];
        }
        return 'Website';
    },
    
    // Submit booking to API
    submitBooking: async function(formData) {
        try {
            // Format the data properly
            const formattedData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || null,
                country: formData.country || null,
                package_id: formData.package_id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                number_of_adults: parseInt(formData.number_of_adults) || 1,
                number_of_children: parseInt(formData.number_of_children) || 0,
                children_ages: formData.children_ages || [],
                special_requests: formData.special_requests || null,
                dietary_restrictions: formData.dietary_restrictions || null,
                medical_conditions: formData.medical_conditions || null,
                booking_source: this.mapBookingSource(formData.booking_source),
                total_price_usd: parseFloat(formData.total_price_usd) || 0
            };
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });
            
            const result = await response.json();
            
            if (result && result.success) {
                return { success: true, data: result };
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Validate form data
    validateBookingForm: function(formData) {
        const errors = [];
        
        if (!formData.full_name || formData.full_name.trim() === '') {
            errors.push('Full name is required');
        }
        
        if (!formData.email || !this.isValidEmail(formData.email)) {
            errors.push('Valid email address is required');
        }
        
        if (!formData.phone || formData.phone.trim() === '') {
            errors.push('Phone number is required');
        }
        
        if (!formData.package_id) {
            errors.push('Please select a safari package');
        }
        
        if (!formData.start_date) {
            errors.push('Start date is required');
        }
        
        if (!formData.end_date) {
            errors.push('End date is required');
        }
        
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            if (start > end) {
                errors.push('End date must be after start date');
            }
        }
        
        if (!formData.terms_agree) {
            errors.push('You must agree to the terms and conditions');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Show success message after booking
    showSuccessMessage: function(name, bookingRef) {
        const mainContent = document.querySelector('.booking-main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="success-message" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">✓</div>
                    <h2>Thank You, ${this.escapeHtml(name)}!</h2>
                    <p>Your booking request has been received successfully.</p>
                    <p><strong>Booking Reference: ${this.escapeHtml(bookingRef)}</strong></p>
                    <p>Please save this reference number for future inquiries.</p>
                    <p>Our safari experts will review your request and get back to you within <strong>24 hours</strong>.</p>
                    <a href="/" style="display: inline-block; margin-top: 2rem; padding: 0.75rem 1.5rem; background: #0f172a; color: white; text-decoration: none; border-radius: 8px;">Return to Home</a>
                </div>
            `;
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    // Show error message
    showError: function(errors) {
        const errorContainer = document.getElementById('formErrors');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                    <strong style="color: #dc2626;">Please fix the following errors:</strong>
                    <ul style="margin-top: 0.5rem; margin-left: 1.5rem; color: #dc2626;">
                        ${errors.map(err => `<li>${this.escapeHtml(err)}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            // Fallback to notification
            this.showNotification(errors[0], 'error');
        }
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '⚠'
        };
        
        const icon = icons[type] || 'ℹ';
        notification.innerHTML = `
            <span style="font-weight: bold; margin-right: 0.5rem;">${icon}</span>
            <span>${this.escapeHtml(message)}</span>
            <button class="notification-close" style="background: none; border: none; margin-left: 1rem; cursor: pointer;">×</button>
        `;
        
        container.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
        }
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (notification.parentElement) notification.remove();
                    }, 300);
                }, 4000);
            }
        }, 10);
        
        setTimeout(() => notification.classList.add('show'), 10);
    },
    
    // Validate email
    isValidEmail: function(email) {
        const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return re.test(email);
    },
    
    // Escape HTML
    escapeHtml: function(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};

// Make it available globally
window.BookingHandler = BookingHandler;