import { SeoService } from "@/services/seo.service";

interface SeoScriptProps {
  pageName: string;
  placement?: 'HEAD' | 'BODY';
}

export default async function SeoScript({ pageName, placement = 'HEAD' }: SeoScriptProps) {
  try {
    const seo = await SeoService.getByPageName(pageName);
    
    // Ignore if not found, inactive, or placement doesn't match
    if (!seo || seo.isActive === false || !seo.scriptCode) {
      return null;
    }

    const configPlacement = (seo.targetType || 'HEAD').toUpperCase();
    if (configPlacement !== placement) {
      return null;
    }

    const scriptCode = seo.scriptCode.trim();
    if (!scriptCode) {
      return null;
    }

    // Check if scriptCode is pure JS without <script> tag or HTML snippet
    const isHtml = scriptCode.includes('<script') || scriptCode.includes('<meta') || scriptCode.includes('<noscript') || scriptCode.includes('<link');

    if (isHtml) {
      return (
        <div 
          style={{ display: 'none' }}
          className={`seo-${placement.toLowerCase()}-snippet`}
          dangerouslySetInnerHTML={{ __html: scriptCode }} 
        />
      );
    }

    // If pure JS code without tags
    return (
      <script
        dangerouslySetInnerHTML={{ __html: scriptCode }}
      />
    );
  } catch (error: any) {
    if (!error.isNetworkError && !error.message?.includes('404')) {
      console.error(`Failed to load SEO script for ${pageName} (${placement}):`, error);
    }
    return null;
  }
}
