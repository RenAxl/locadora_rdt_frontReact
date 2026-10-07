import "./Contact.css";

export function Contact() {
  return (
    <div className="contact-screen">
      <main className="contact-page">
        <section className="contact-hero">
          <div className="hero-content">
            <span className="eyebrow">FALE COM A GENTE</span>
            <h1>Como podemos ajudar?</h1>
            <p>
              Entre em contato com a Locadora RDT para tirar dúvidas sobre
              jogos, locações, devoluções e atendimento ao cliente.
            </p>

            <a className="primary-contact" href="tel:+553134532000">
              <i className="fa-solid fa-phone"></i>
              <span>
                <small>Telefone / Whatsapp</small>
                <strong>(31) 3 4532-0000</strong>
              </span>
            </a>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-circle art-circle-large"></div>
            <div className="art-circle art-circle-small"></div>
            <div className="controller-icon">
              <i className="fa-solid fa-headset"></i>
            </div>
          </div>
        </section>

        <section className="contact-options">
          <article className="contact-card">
            <div className="card-icon">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <h2>Atendimento por Telefone ou Whatsapp</h2>
            <p>
              Converse diretamente com a equipe para receber ajuda e
              orientações.
            </p>
            <a href="tel:+553134532000">Ligar para (31) 3 4532-0000</a>
          </article>

          <article className="contact-card">
            <div className="card-icon">
              <i className="fa-solid fa-gamepad"></i>
            </div>
            <h2>Dúvidas sobre locações</h2>
            <p>
              Consulte disponibilidade, prazos, devoluções ou informações sobre
              uma locação em andamento.
            </p>
            <a href="tel:+553134532000">Falar com a Locadora RDT</a>
          </article>

          <article className="contact-card">
            <div className="card-icon">
              <i className="fa-regular fa-clock"></i>
            </div>
            <h2>Horário de atendimento</h2>
            <p>Segunda a sexta, das 9h às 18h, e sábado, das 9h às 13h.</p>
            <span className="availability">
              <i className="fa-solid fa-circle"></i>
              Equipe pronta para ajudar
            </span>
          </article>
        </section>

        <section className="contact-footer">
          <div>
            <span className="eyebrow dark">LOCADORA RDT</span>
            <h2>Boas histórias começam com uma boa conversa.</h2>
          </div>
        </section>
      </main>
    </div>
  );
}
