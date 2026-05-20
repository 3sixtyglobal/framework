const M = ({ children }) => (
	<span
		style={{
			fontFamily: 'monospace',
			background: 'rgba(0,0,0,0.25)',
			color: 'inherit',
			borderRadius: '3px',
			padding: '1px 5px',
			fontSize: '0.9em'
		}}
	>
		{children}
	</span>
);

export function DataValidationFlowDiagram() {
	return (
		<div
			style={{
				background: 'linear-gradient(135deg, #122457 0%, #0d1b43 100%)',
				borderRadius: '12px',
				padding: '16px',
				margin: '1rem 0 1.5rem'
			}}
		>
			<style>{`
        .data-validation-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .data-validation-branches {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        @media (max-width: 760px) {
          .data-validation-branches {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
			<p style={{ margin: '0 0 12px', color: '#ffffff', fontWeight: 700 }}>
				Data Validation End-to-End Flow
			</p>
			<div className="data-validation-grid">
				<div
					style={{
						background: '#e8e8ea',
						color: '#091124',
						borderRadius: '8px',
						padding: '10px 14px',
						textAlign: 'center'
					}}
				>
					<strong>TypeScript Models</strong>
					<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
						Source interfaces and type definitions across the data and standards workspaces
					</div>
				</div>

				<div style={{ textAlign: 'center', color: '#aec6f0', lineHeight: 1.2 }}>▼</div>

				<div
					style={{
						background: '#4b84e0',
						color: '#071127',
						borderRadius: '8px',
						padding: '10px 14px',
						textAlign: 'center'
					}}
				>
					<strong>Schema Generation</strong>
					<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
						<M>ts-to-schema</M> converts TypeScript model definitions into JSON Schema documents
					</div>
				</div>

				<div style={{ textAlign: 'center', color: '#aec6f0', lineHeight: 1.2 }}>▼</div>

				<div
					style={{
						background: '#263f83',
						color: '#f7faff',
						borderRadius: '8px',
						padding: '10px 14px',
						textAlign: 'center'
					}}
				>
					<strong>Type Registration and Validation Entry Point</strong>
					<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
						<M>DataTypeHandlerFactory</M> registers handlers by type id, while <M>DataTypeHelper</M>{' '}
						selects validation mode and dispatches runtime validation
					</div>
				</div>

				<div style={{ textAlign: 'center', color: '#aec6f0', lineHeight: 1.2 }}>▼</div>

				<div className="data-validation-branches">
					<div
						style={{
							background: '#1a3370',
							color: '#eef4ff',
							borderRadius: '8px',
							padding: '10px 12px'
						}}
					>
						<strong>JSON Schema Path</strong>
						<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
							<M>JsonSchemaHelper</M> compiles schemas through AJV and returns structured validation
							failures
						</div>
					</div>

					<div
						style={{
							background: '#1a3370',
							color: '#eef4ff',
							borderRadius: '8px',
							padding: '10px 12px'
						}}
					>
						<strong>JSON-LD Path</strong>
						<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
							<M>JsonLdProcessor</M> expands and resolves document context, then <M>JsonLdHelper</M>{' '}
							maps <M>@type</M> values back into registered validation types
						</div>
					</div>
				</div>

				<div style={{ textAlign: 'center', color: '#aec6f0', lineHeight: 1.2 }}>▼</div>

				<div
					style={{
						background: '#f6aa42',
						color: '#091124',
						borderRadius: '8px',
						padding: '10px 14px',
						textAlign: 'center'
					}}
				>
					<strong>Validation Result</strong>
					<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
						A consistent runtime outcome in the form of structured validation failures or a
						successful validation pass
					</div>
				</div>

				<div
					style={{
						marginTop: '4px',
						background: 'rgba(255,255,255,0.08)',
						color: '#f7faff',
						borderRadius: '8px',
						padding: '10px 14px'
					}}
				>
					<strong>Parallel Tooling Output</strong>
					<div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
						The same TypeScript model layer also feeds <M>ts-to-openapi</M> for API description
						generation, keeping schema and API outputs aligned around shared source types
					</div>
				</div>
			</div>
		</div>
	);
}
