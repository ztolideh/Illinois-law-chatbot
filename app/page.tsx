import "./pageStyles.css";
import Chat from "./components/Chat";

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-page__background" />
      <div className="home-page__content">
        <section className="hero-card">
          <div className="hero-card__body">
            <p className="hero-badge">⚖️ Illinois Law · AI Interface</p>
            <h1 className="hero-title">
              illinoisLaw.ai
            </h1>
            <h2 className="hero-subtitle">
              Your modern Illinois law AI, built for fast answers, legislative
              insight, and a premium visual experience.
            </h2>
            <p className="hero-description">
              Explore Illinois statutes, analyze bills, and get instant
              guidance in a polished conversational interface with futuristic
              UI details.
            </p>
            <div className="hero-pills">
              <span className="hero-pill">AI bill summarization</span>
              <span className="hero-pill">Illinois legal context</span>
            </div>
          </div>
        </section>
        <Chat />
      </div>
    </main>
  );
}
