import Link from "next/link"

interface FormFooterLinkProps {
    text: string
    linkText: string
    href: string
}

export const FormFooterLink = ({ text, linkText, href }: FormFooterLinkProps) => {
    return (
        <p className="text-center text-xs text-carbon/60">
            {text}{" "}
            <Link href={href} className="text-carbon font-semibold hover:underline">
                {linkText}
            </Link>
        </p>
    )
}
