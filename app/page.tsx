import Chat from "./components/Chat";
import styles from "./styles/Page.module.css";

export default function Home() {
  return (
    <main className={styles.homePage}>
      <div className={styles.homePageBackground} />
      <div className={styles.homePageContent}>
        <section className={styles.heroCard}>
          <div className={styles.heroCardBody}>
            <p className={styles.heroBadge}>⚖️ Illinois Law · AI Interface</p>
            <h1 className={styles.heroTitle}>
              illinoisLaw.ai
            </h1>
            <h2 className={styles.heroSubtitle}>
              Your modern Illinois law AI, built for fast answers, legislative
              insight, and a premium visual experience.
            </h2>
            <p className={styles.heroDescription}>
              Explore Illinois statutes, analyze bills, and get instant
              guidance in a polished conversational interface with futuristic
              UI details.
            </p>
            <div className={styles.heroPills}>
              <span className={styles.heroPill}>AI bill summarization</span>
              <span className={styles.heroPill}>Illinois legal context</span>
            </div>
          </div>
        </section>
        <Chat />
      </div>
    </main>
  );
}
