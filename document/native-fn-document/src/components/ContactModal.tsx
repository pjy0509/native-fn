import React from "react";
import ReactDOM from "react-dom";
import emailjs from "@emailjs/browser";
import styled, {keyframes, css} from "styled-components";

type SendStatus = "idle" | "loading" | "success" | "error" | "disabled";

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const spin = keyframes`
    to {
        transform: rotate(360deg);
    }
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    padding: 1rem;
    animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
    width: 100%;
    max-width: 480px;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    animation: ${slideUp} 0.22s ease;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ModalTitle = styled.h2`
    font-size: 1rem;
    font-weight: 600;
    color: ${({theme}) => theme.colors.text};
    margin: 0;
`;

const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: ${({theme}) => theme.colors.textMuted};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: ${({theme}) => theme.colors.surfaceHover};
        color: ${({theme}) => theme.colors.text};
    }
`;

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
`;

const Label = styled.label`
    font-size: 0.75rem;
    font-weight: 500;
    color: ${({theme}) => theme.colors.textMuted};
    letter-spacing: 0.03em;
    text-transform: uppercase;
`;

const inputBase = css`
    width: 100%;
    border-radius: 6px;
    font-size: 0.875rem;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.15s;

    &::placeholder {
        color: ${({theme}) => theme.colors.textMuted};
        opacity: 0.6;
    }

    &:focus {
        border-color: ${({theme}) => theme.colors.accent};
    }
`;

const Input = styled.input`
    ${
            css`
                ${inputBase};
                padding: 0.5rem 0.75rem;
                border: 1px solid ${({theme}) => theme.colors.border};
                background: ${({theme}) => theme.colors.surface};
                color: ${({theme}) => theme.colors.text};
            `
    }
`;

const Textarea = styled.textarea`
    ${
            css`
                ${inputBase};
                padding: 0.625rem 0.75rem;
                border: 1px solid ${({theme}) => theme.colors.border};
                background: ${({theme}) => theme.colors.surface};
                color: ${({theme}) => theme.colors.text};
                resize: vertical;
                min-height: 120px;
                line-height: 1.5;
            `
    }
`;

const SendButton = styled.button<{ status: SendStatus }>`
    width: 100%;
    padding: 0.625rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: opacity 0.15s, transform 0.15s, background 0.2s, border-color 0.2s;

    ${({status, theme}) => {
        switch (status) {
            case "disabled":
                return css`
                    border: 1px solid ${theme.colors.border};
                    background: transparent;
                    color: ${theme.colors.textMuted};
                    cursor: not-allowed;
                    opacity: 0.5;
                `;
            case "idle":
                return css`
                    border: 1px solid ${theme.colors.accent};
                    background: ${theme.colors.accent};
                    color: #fff;
                    cursor: pointer;

                    &:hover {
                        opacity: 0.88;
                    }

                    &:active {
                        transform: scale(0.98);
                    }
                `;
            case "loading":
                return css`
                    border: 1px solid ${theme.colors.border};
                    background: transparent;
                    color: ${theme.colors.textMuted};
                    cursor: not-allowed;
                `;
            case "success":
                return css`
                    border: 1px solid #22c55e;
                    background: #22c55e18;
                    color: #22c55e;
                    cursor: default;
                `;
            case "error":
                return css`
                    border: 1px solid #ef4444;
                    background: #ef444418;
                    color: #ef4444;
                    cursor: pointer;

                    &:hover {
                        opacity: 0.88;
                    }

                    &:active {
                        transform: scale(0.98);
                    }
                `;
            default:
                return css`
                    border: 1px solid ${theme.colors.border};
                    background: transparent;
                    color: ${theme.colors.textMuted};
                    cursor: not-allowed;
                `;
        }
    }}
`;

const Spinner = styled.span`
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 0.6s linear infinite;
    flex-shrink: 0;
`;

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId: string;
    templateId: string;
    publicKey: string;
}

export default function ContactModal({isOpen, onClose, serviceId, templateId, publicKey,}: ContactModalProps) {
    const [title, setTitle] = React.useState("");
    const [name, setName] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [status, setStatus] = React.useState<SendStatus>("idle");

    const canSend = status !== "loading" && status !== "success"
        && message.trim().length > 0;

    const buttonStatus: SendStatus = canSend ? status : status === "loading" || status === "success" ? status : "disabled";

    React.useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    React.useEffect(() => {
        if (isOpen) {
            setTitle("");
            setMessage("");
            setStatus("idle");
        }
    }, [isOpen]);

    const handleSend = React.useCallback(async () => {
        if (!canSend) return;

        setStatus("loading");

        try {
            await emailjs.send(
                serviceId,
                templateId,
                {
                    title,
                    name,
                    message,
                },
                publicKey,
            );

            setStatus("success");
            setTimeout(onClose, 1500);
        } catch {
            setStatus("error");
        }
    }, [canSend, serviceId, templateId, publicKey, title, message, onClose]);

    const buttonLabel = () => {
        switch (status) {
            case "loading":
                return <><Spinner/>Sending...</>;
            case "success":
                return <>✓ Sent!</>;
            case "error":
                return <>Try again</>;
            default:
                return <>Send message</>;
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>Contact Us</ModalTitle>

                    <CloseButton onClick={onClose} aria-label="Close">
                        <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </CloseButton>
                </ModalHeader>

                <Field>
                    <Label>Subject</Label>
                    <Input
                        placeholder="Enter a subject"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </Field>

                <Field>
                    <Label>Name</Label>
                    <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Field>

                <Field>
                    <Label>Message</Label>
                    <Textarea
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </Field>

                <SendButton
                    status={buttonStatus}
                    onClick={handleSend}
                >
                    {buttonLabel()}
                </SendButton>
            </Modal>
        </Overlay>,
        document.body
    );
}
