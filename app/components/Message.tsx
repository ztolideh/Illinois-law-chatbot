"use client";

import { ChatMessage } from "@/types/message";
import styles from "./styles/Message.module.css";

interface Props {
  message: ChatMessage;
}

export default function Message({ message }: Props) {

  const isUser = message.role === "user";

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}>
      <div className={`${styles.messageBubble} ${isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}>
        <div className={styles.messageMeta}>
          <span className={styles.messageBadge}>{isUser ? "You" : "Illinois Law AI"}</span>
        </div>
        <p className={styles.messageText}>{message.content}</p>
      </div>
    </div>
  );
}