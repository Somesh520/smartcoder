import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
    return (
        <Helmet>
            { /* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            { /* End standard metadata tags */}

            { /* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            { /* End Facebook tags */}

            { /* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
            { /* End Twitter tags */}

            { /* Canonical URL */}
            {url && <link rel="canonical" href={url} />}
        </Helmet>
    )
}

SEO.defaultProps = {
    title: 'AlgoDuel - Competitive Coding Arena',
    description: 'Join AlgoDuel to compete in real-time coding battles, practice algorithms, and improve your programming skills.',
    name: 'AlgoDuel',
    type: 'website'
}

export default SEO;
