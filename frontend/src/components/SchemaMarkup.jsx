import React from 'react';
import { Helmet } from 'react-helmet-async';

const SchemaMarkup = () => {
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AlgoDuel",
        "url": "https://smartcoder-black.vercel.app/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://smartcoder-black.vercel.app/app/problems?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "AlgoDuel",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "The ultimate competitive programming arena. Battle in real-time execution environments with multiplayer sync.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1024"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(websiteSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(softwareAppSchema)}
            </script>
        </Helmet>
    );
};

export default SchemaMarkup;
