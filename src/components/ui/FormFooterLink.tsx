import Link from "next/link"

interface FormFooterLinkProps {
    text: string
    linkText: string
    href: string
}

export const FormFooterLink = ({ text, linkText, href }: FormFooterLinkProps) => {
    return (
        <p className="text-center text-xs text-slate-500">
            {text}{" "}
            <Link href={href} className="text-slate-900 font-semibold hover:underline">
                {linkText}
            </Link>
        </p>
    )
}
