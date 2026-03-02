// Case Studies Display and Filter Script

document.addEventListener('DOMContentLoaded', function() {
    let caseStudies = [];
    let salesforceStudies = [];
    let nonSalesforceStudies = [];
    let filteredSalesforce = [];
    let filteredNonSalesforce = [];
    
    // Check if a case study is Salesforce-based
    function isSalesforceStudy(study) {
        return study.technologies.some(tech => 
            tech.toLowerCase().includes('salesforce') || 
            tech.toLowerCase().includes('pardot') ||
            tech.toLowerCase().includes('marketing cloud') ||
            tech.toLowerCase().includes('field service lightning') ||
            tech.toLowerCase().includes('lightning') ||
            tech.toLowerCase().includes('apex') ||
            tech.toLowerCase().includes('lwc')
        ) || study.services.some(service => 
            service.toLowerCase().includes('salesforce')
        );
    }
    
    // Load case studies from JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            caseStudies = data;
            // Categorize case studies
            salesforceStudies = caseStudies.filter(isSalesforceStudy);
            nonSalesforceStudies = caseStudies.filter(study => !isSalesforceStudy(study));
            filteredSalesforce = salesforceStudies;
            filteredNonSalesforce = nonSalesforceStudies;
            renderCaseStudies();
            setupFilters();
        })
        .catch(error => {
            console.error('Error loading case studies:', error);
            const salesforceGrid = document.getElementById('salesforce-studies-grid');
            const nonSalesforceGrid = document.getElementById('non-salesforce-studies-grid');
            if (salesforceGrid) salesforceGrid.innerHTML = '<div class="no-results">Error loading case studies. Please refresh the page.</div>';
            if (nonSalesforceGrid) nonSalesforceGrid.innerHTML = '<div class="no-results">Error loading case studies. Please refresh the page.</div>';
        });
    
    // Render single card
    function renderCard(study) {
        const useCaseHtml = study.useCaseSummary ? `
            <div class="case-study-use-case">
                <button type="button" class="case-study-use-case-toggle" aria-expanded="false" data-target="use-case-${study.id}">
                    <span class="material-symbols-outlined" style="font-size:18px">expand_more</span>
                    <span class="use-case-label">View Use Case</span>
                </button>
                <div class="case-study-use-case-content" id="use-case-${study.id}" hidden>${String(study.useCaseSummary).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
        ` : '';
        return `
            <div class="case-study-card" data-id="${study.id}" id="study-${study.id}">
                <div class="case-study-year">${study.year}</div>
                <div class="case-study-header">
                    <span class="case-study-industry">${study.industry}</span>
                    <h3 class="case-study-title">${study.title}</h3>
                    ${study.client ? `<div class="case-study-client">${study.client}</div>` : ''}
                </div>
                <div class="case-study-content">
                    <div class="case-study-overview">
                        <h4>Overview</h4>
                        <p>${study.industry}${study.client ? ' · ' + study.client : ''}. ${(study.challenge || '').substring(0, 180)}${(study.challenge || '').length > 180 ? '…' : ''}</p>
                    </div>
                    <div class="case-study-challenge">
                        <h4>Challenge</h4>
                        <p>${study.challenge}</p>
                    </div>
                    <div class="case-study-solution">
                        <h4>Solution</h4>
                        <p>${study.solution}</p>
                    </div>
                    <div class="case-study-results">
                        <h4>Results</h4>
                        <p>${study.results}</p>
                    </div>
                    <div class="case-study-tech-stack">
                        <h4>Tech stack</h4>
                        <p>${(study.technologies || []).join(', ') || '—'}</p>
                    </div>
                </div>
                ${useCaseHtml}
                <div class="case-study-tags">
                    ${(study.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    ${(study.services || []).map(service => `<span class="service-tag">${service}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Render case studies
    function renderCaseStudies() {
        const salesforceGrid = document.getElementById('salesforce-studies-grid');
        const nonSalesforceGrid = document.getElementById('non-salesforce-studies-grid');
        
        // Render Salesforce studies
        if (salesforceGrid) {
            if (filteredSalesforce.length === 0) {
                salesforceGrid.innerHTML = '<div class="no-results">No Salesforce case studies match your filters. Try adjusting your search criteria.</div>';
            } else {
                salesforceGrid.innerHTML = filteredSalesforce.map(study => renderCard(study)).join('');
            }
        }
        
        // Render Non-Salesforce studies
        if (nonSalesforceGrid) {
            if (filteredNonSalesforce.length === 0) {
                nonSalesforceGrid.innerHTML = '<div class="no-results">No custom web application case studies match your filters. Try adjusting your search criteria.</div>';
            } else {
                nonSalesforceGrid.innerHTML = filteredNonSalesforce.map(study => renderCard(study)).join('');
            }
        }
        
        // Use case toggle handlers
        document.querySelectorAll('.case-study-use-case-toggle').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const targetId = this.getAttribute('data-target');
                const content = document.getElementById(targetId);
                if (!content) return;
                const isExpanded = content.hidden;
                content.hidden = !isExpanded;
                this.setAttribute('aria-expanded', isExpanded);
                const icon = this.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = isExpanded ? 'expand_less' : 'expand_more';
                const label = this.querySelector('.use-case-label');
                if (label) label.textContent = isExpanded ? 'Hide Use Case' : 'View Use Case';
            });
        });
        
        // Hide/show sections based on content
        const salesforceSection = document.querySelector('#salesforce-studies-grid')?.closest('.case-studies-section');
        const nonSalesforceSection = document.querySelector('#non-salesforce-studies-grid')?.closest('.case-studies-section');
        
        if (salesforceSection) {
            salesforceSection.style.display = filteredSalesforce.length > 0 ? 'block' : 'none';
        }
        if (nonSalesforceSection) {
            nonSalesforceSection.style.display = filteredNonSalesforce.length > 0 ? 'block' : 'none';
        }
    }
    
    // Setup filters
    function setupFilters() {
        const industryFilter = document.getElementById('filter-industry');
        const serviceFilter = document.getElementById('filter-service');
        const techFilter = document.getElementById('filter-tech');
        const searchInput = document.getElementById('search-studies');
        
        // Populate filter options
        const industries = [...new Set(caseStudies.map(s => s.industry))].sort();
        const services = [...new Set(caseStudies.flatMap(s => s.services))].sort();
        const technologies = [...new Set(caseStudies.flatMap(s => s.technologies))].sort();
        
        if (industryFilter) {
            industryFilter.innerHTML = '<option value="">All Industries</option>' + 
                industries.map(ind => `<option value="${ind}">${ind}</option>`).join('');
        }
        
        if (serviceFilter) {
            serviceFilter.innerHTML = '<option value="">All Services</option>' + 
                services.map(svc => `<option value="${svc}">${svc}</option>`).join('');
        }
        
        if (techFilter) {
            techFilter.innerHTML = '<option value="">All Technologies</option>' + 
                technologies.map(tech => `<option value="${tech}">${tech}</option>`).join('');
        }
        
        // Filter handlers
        function applyFilters() {
            const industry = industryFilter ? industryFilter.value : '';
            const service = serviceFilter ? serviceFilter.value : '';
            const tech = techFilter ? techFilter.value : '';
            const search = searchInput ? searchInput.value.toLowerCase() : '';
            
            function matchesFilters(study) {
                const matchIndustry = !industry || study.industry === industry;
                const matchService = !service || study.services.includes(service);
                const matchTech = !tech || study.technologies.includes(tech);
                const matchSearch = !search || 
                    study.title.toLowerCase().includes(search) ||
                    study.challenge.toLowerCase().includes(search) ||
                    study.solution.toLowerCase().includes(search) ||
                    study.results.toLowerCase().includes(search) ||
                    study.industry.toLowerCase().includes(search);
                
                return matchIndustry && matchService && matchTech && matchSearch;
            }
            
            filteredSalesforce = salesforceStudies.filter(matchesFilters);
            filteredNonSalesforce = nonSalesforceStudies.filter(matchesFilters);
            
            renderCaseStudies();
            updateResultsCount();
        }
        
        if (industryFilter) industryFilter.addEventListener('change', applyFilters);
        if (serviceFilter) serviceFilter.addEventListener('change', applyFilters);
        if (techFilter) techFilter.addEventListener('change', applyFilters);
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(applyFilters, 300);
            });
        }
        updateResultsCount();
    }
    
    // Update results count
    function updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            const totalFiltered = filteredSalesforce.length + filteredNonSalesforce.length;
            const total = caseStudies.length;
            countElement.textContent = `Showing ${totalFiltered} of ${total} case studies (${filteredSalesforce.length} Salesforce, ${filteredNonSalesforce.length} Custom Applications)`;
        }
    }
});
