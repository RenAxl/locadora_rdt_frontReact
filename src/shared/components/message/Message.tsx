import './Message.css';

interface MessageProps {
  visible: boolean;
  text: string;
}

export function Message({ visible, text }: MessageProps) {
  if (!visible) return null;
  return <div className="p-message p-message-error">{text}</div>;
}
