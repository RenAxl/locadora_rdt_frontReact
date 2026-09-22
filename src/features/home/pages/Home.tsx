import { Link } from "react-router-dom";
import "./Home.css";

const games = [
  { name: "Super Mario Galaxy", className: "mario" },
  { name: "Final Fantasy VII Rebirth", className: "final-fantasy" },
  { name: "Zelda: Ocarina of Time", className: "zelda" },
  { name: "Metal Gear Solid", className: "metal-gear" },
  { name: "Resident Evil 4 Remake", className: "resident-evil" },
];

export function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">SUA JORNADA COMEÇA AQUI</span>
          <h1>Bem-vindo à Locadora RDT</h1>
          <p>
            Um espaço criado para organizar locações, catálogo, clientes e
            estoque, deixando a gestão mais simples para que grandes histórias
            continuem chegando às mãos de cada jogador.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="btn btn-primary home-button">
              <i className="fa-solid fa-gamepad" /> Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="section-heading">
          <span className="eyebrow dark">CLÁSSICOS E NOVAS AVENTURAS</span>
          <h2>Jogos que atravessam gerações</h2>
          <p>
            A Locadora RDT aproxima jogadores de experiências inesquecíveis e
            oferece uma gestão completa para acompanhar cada item, locação e
            devolução com segurança.
          </p>
        </div>
        <div className="games-grid">
          {games.map((game) => (
            <article className="game-card" key={game.name}>
              <div className={`game-image ${game.className}`} />
              <div className="game-card-content">
                <i className="fa-solid fa-star" />
                <h3>{game.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="purpose-section">
        <div className="purpose-icon">
          <i className="fa-solid fa-compact-disc" />
        </div>
        <div>
          <span className="eyebrow dark">NOSSO OBJETIVO</span>
          <h2>Tornar a locação de games organizada, ágil e memorável.</h2>
          <p>
            Da entrada do item no estoque até a devolução pelo cliente, a
            Locadora RDT reúne as informações essenciais em um único sistema,
            ajudando a equipe a cuidar do negócio e da experiência de quem joga.
          </p>
        </div>
      </section>
    </main>
  );
}
