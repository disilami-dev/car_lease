# Local Run Guide

<pre>
git remote -v
git status
cargo test --workspace
cargo build --workspace --target wasm32v1-none --release
cd frontend
npm install
npm run dev
</pre>
