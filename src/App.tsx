import "./App.css";
import TetrisGame from "./game/tetrisGame";

function App() {
  return (
    // <main className="container flex flex-col items-center gap-8 font-sans">
    //   <div className="text-2xl">Welcome to Tetris</div>

    //   <div className="row">
    //     <a href="https://tauri.app" target="_blank">
    //       <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
    //     </a>
    //   </div>
    //   <p>Start the game.</p>

    //   <form
    //     className="row"
    //     onSubmit={(e) => {
    //       e.preventDefault();
    //       greet();
    //     }}
    //   >
    //     <input
    //       id="greet-input"
    //       onChange={(e) => setName(e.currentTarget.value)}
    //       placeholder="Enter a name..."
    //     />
    //     <button type="submit">Greet</button>
    //   </form>
    //   <p>{greetMsg}</p>
    // </main>
    <div className="w-full h-screen overflow-hidden">
      <TetrisGame />
    </div>
  );
}

export default App;
