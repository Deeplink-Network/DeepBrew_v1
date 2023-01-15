import { Container, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import LogoWithText from 'assets/logo.png';

import './Header.scss';
import { useState } from 'react';

const Header = () => {
  const [isAbout, setIsAbout] = useState(false);
  const [isTech, setIsTech] = useState(false);

  return (
    <div className="header-sticky">
      <Navbar collapseOnSelect expand="lg" className="header" variant="dark">
        <Container style={{ padding: '0 4rem' }}>
          <Navbar.Brand>
            <div className="header-logo">
              <Link to="/">
                <img
                  src={LogoWithText}
                  alt="logo"
                  onClick={() => window.open('https://www.deeplink.network/')}
                />
              </Link>

              <button
                onClick={() => window.open('https://www.deeplink.network/etax')}
              >
                Eta X
              </button>
            </div>
          </Navbar.Brand>

          <div
            className="header-item__wrapper"
            onMouseEnter={() => setIsAbout(true)}
            onMouseLeave={() => setIsAbout(false)}
          >
            <div className="header-item inactive">About</div>

            {isAbout && (
              <div className="header-item__sub">
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/about')
                  }
                >
                  About
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/documentation')
                  }
                >
                  Documentation
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/jobs')
                  }
                >
                  Career
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/contact')
                  }
                >
                  Contact
                </span>
              </div>
            )}
          </div>

          <div
            className="header-item__wrapper"
            onMouseEnter={() => setIsTech(true)}
            onMouseLeave={() => setIsTech(false)}
          >
            <div className="header-item inactive">Technology</div>
            {isTech && (
              <div className="header-item__sub">
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/cnidaria')
                  }
                >
                  Cnidaria
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/deepbrew')
                  }
                >
                  DeepBrew
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/clusters')
                  }
                >
                  Clusters
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/superclusters')
                  }
                >
                  SuperClusters
                </span>
                <span
                  onClick={() =>
                    window.open('https://www.deeplink.network/dkeepers')
                  }
                >
                  DKeepers
                </span>
              </div>
            )}
          </div>

          <div
            className="header-item"
            onClick={() => window.open('https://www.deeplink.network/research')}
          >
            Research
          </div>

          <div
            className="header-item"
            onClick={() =>
              window.open('https://www.deeplink.network/openrddao')
            }
          >
            Open R&D DAO
          </div>
          <div
            className="header-item"
            onClick={() => window.open('https://dg.deeplink.network/')}
          >
            Airdrop & Staking
          </div>
          <div
            className="header-item header-item__active"
            onClick={() =>
              window.open('https://www.deeplink.network/verified-contributor')
            }
          >
            Become a Contributor
          </div>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
