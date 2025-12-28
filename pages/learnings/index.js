import Link from "next/link";

function Learnings() {
  return (
    <>
      <h1>Learnings Page</h1>
      <ol>
        <li>
          Backend
          <ul>
            <li>
              <Link href="/api/v1/status" className="is-link">
                API
              </Link>
            </li>
          </ul>
        </li>
        <li>
          Frontend
          <ul>
            <li>
              <Link href="/" className="is-link">
                Home
              </Link>
            </li>
            <li>
              Animações
              <ul>
                <li>
                  <Link href="/particles" className="is-link">
                    Particles
                  </Link>
                </li>
                <li>
                  <Link href="/five" className="is-link">
                    Backgrounds
                  </Link>
                </li>
                <li>
                  <Link href="/galaxy" className="is-link">
                    Galaxy
                  </Link>
                </li>
                <li>
                  <Link href="/haunted-house" className="is-link">
                    Haunted House
                  </Link>
                </li>
                <li>
                  <Link href="/lights" className="is-link">
                    Lights
                  </Link>
                </li>
                <li>
                  <Link href="/shadows" className="is-link">
                    Shadows
                  </Link>
                </li>
                <li>
                  <Link href="/three" className="is-link">
                    Basics
                  </Link>
                </li>
                <li>
                  <Link href="/physics" className="is-link">
                    Physics
                  </Link>
                </li>
                <li>
                  <Link href="/imports" className="is-link">
                    Imports
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
      <style global jsx>{`
        .is-link {
          padding-left: 10px;
        }
      `}</style>
    </>
  );
}

export default Learnings;
