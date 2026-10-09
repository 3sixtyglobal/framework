export function PackageLayersDiagram() {
	return (
		<div>
			<style>{`
        .brand-arch {
          background: linear-gradient(135deg, #122457 0%, #0d1b43 50%, #102450 100%);
          border-radius: 14px;
          padding: 18px;
          color: #f8fbff;
          margin: 1rem 0 1.5rem;
        }

        .brand-arch h3 {
          margin: 0 0 14px;
          font-size: 1.5rem;
          color: #ffffff;
        }

        .brand-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 16px;
          border-radius: 12px;
          padding: 12px 14px;
          margin: 10px 0;
          border: 1px solid rgba(255, 255, 255, 0.22);
        }

        .brand-row-base {
          background: #e8e8ea;
          color: #091124;
        }

        .brand-row-connectors,
        .brand-row-dlt {
          background: #263f83;
          color: #f7faff;
        }

        .brand-row-blocks {
          background: #4b84e0;
          color: #071127;
        }

        .brand-row-engine,
        .brand-row-node,
        .brand-row-ui {
          background: #f6aa42;
          color: #091124;
        }

        .brand-row-apps {
          background: #fa7e07;
          color: #091124;
        }

        .brand-label {
          font-weight: 700;
          align-self: center;
          font-size: 1.02rem;
          line-height: 1.2;
        }

        .brand-cols {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px 16px;
        }

        .brand-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .brand-cols-1 {
          grid-template-columns: 1fr;
        }

        .brand-list {
          margin: 0;
          padding-left: 1.1rem;
        }

        .brand-list li {
          margin: 0.1rem 0;
          line-height: 1.3;
        }

        .brand-runtime {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .brand-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .brand-cols,
          .brand-cols-2,
          .brand-runtime {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

			<div className="brand-arch">
				<div className="brand-row brand-row-base">
					<div className="brand-label">Base Layer</div>
					<div className="brand-cols brand-cols-2">
						<ul className="brand-list">
							<li>Fundamentals (Is, Guards, i18n)</li>
							<li>Cryptography</li>
							<li>Tools (TypeScript to Schema, TypeScript to OpenAPI)</li>
						</ul>
						<ul className="brand-list">
							<li>Standards (Schema.org, DID, ODRL, GS1, UN/CEFACT)</li>
							<li>Data (JSON-LD)</li>
							<li>API Core</li>
						</ul>
					</div>
				</div>

				<div className="brand-row brand-row-connectors">
					<div className="brand-label">Components, Connectors</div>
					<div className="brand-cols brand-cols-2">
						<ul className="brand-list">
							<li>Logging, Telemetry, Background Tasks, Event Bus</li>
							<li>Entity Storage (MySql, Mongo, Scylla, AWS, Azure, GCP)</li>
							<li>Blob Storage (IPFS, AWS, Azure, GCP)</li>
						</ul>
						<ul className="brand-list">
							<li>Messaging (AWS)</li>
							<li>Vault (Hashicorp)</li>
						</ul>
					</div>
				</div>

				<div className="brand-row brand-row-dlt">
					<div className="brand-label">DLT Connectors</div>
					<div className="brand-cols brand-cols-2">
						<ul className="brand-list">
							<li>Wallet / Gas Station</li>
							<li>Identity</li>
						</ul>
						<ul className="brand-list">
							<li>NFT</li>
							<li>Verifiable Storage</li>
						</ul>
					</div>
				</div>

				<div className="brand-row brand-row-blocks">
					<div className="brand-label">Building Blocks</div>
					<div className="brand-cols">
						<ul className="brand-list">
							<li>Auditable Item Graph</li>
							<li>Auditable Item Streams</li>
							<li>Document Management</li>
						</ul>
						<ul className="brand-list">
							<li>Attestation</li>
							<li>Immutable Proof</li>
							<li>Rights Management</li>
						</ul>
						<ul className="brand-list">
							<li>Data Processing</li>
							<li>Federated Catalogue</li>
							<li>Dataspace</li>
						</ul>
					</div>
				</div>

				<div className="brand-runtime">
					<div>
						<div className="brand-row brand-row-engine" style={{ margin: 0 }}>
							<div className="brand-label">Engine</div>
							<div className="brand-cols brand-cols-1">
								<ul className="brand-list">
									<li>Engine Core</li>
									<li>Engine Server (REST/WebSocket)</li>
								</ul>
							</div>
						</div>

						<div className="brand-row brand-row-node">
							<div className="brand-label">Node</div>
							<div className="brand-cols brand-cols-1">
								<ul className="brand-list">
									<li>Node Core</li>
									<li>Node</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="brand-row brand-row-ui" style={{ margin: 0 }}>
						<div className="brand-label">UI</div>
						<div className="brand-cols brand-cols-1">
							<ul className="brand-list">
								<li>React UI Components</li>
								<li>Svelte UI Components</li>
								<li>Identity Components (Future)</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="brand-row brand-row-apps" style={{ marginBottom: 0 }}>
					<div className="brand-label">Applications</div>
					<div className="brand-cols brand-cols-2">
						<ul className="brand-list">
							<li>Playground</li>
							<li>TWIN Identity</li>
						</ul>
						<ul className="brand-list">
							<li>Supply Chain App</li>
							<li>TLIP</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
