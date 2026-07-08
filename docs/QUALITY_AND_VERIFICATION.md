# Quality and Verification

<pre>
cargo test --workspace
cargo build --workspace --target wasm32v1-none --release
cd frontend
npm test
npm run build
</pre>

Generated files must not be committed.
