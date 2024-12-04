import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";

export const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realtimeeditor"),
        {
          mode: "javascript", // Set mode to JavaScript
          theme: "dracula", // Set the theme to Dracula
          autoCloseTags: true, // Enable auto-closing of tags
          autoCloseBrackets: true, // Enable auto-closing of brackets
          lineNumbers: true, // Enable line numbers
          viewportMargin: Infinity, // Ensure editor is always fully visible
          tabSize: 2, // Set tab size to 2 spaces
          indentWithTabs: false, // Use spaces instead of tabs
        }
      );
      // This event is fired every time the content of the editor changes.(not a socket event)
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue(); //instance-> current instance of the editor
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit("code-change", {
            //frontend to backend
            roomId,
            code,
          });
        }
      });
    };
    init();
  }, []); // Empty dependency array means this effect runs only once

  useEffect(() => {
    if (socketRef.current) {
      //Listening for code-change event
      socketRef.current.on("code-change", ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off("code-change"); //for unsubscribing the code-change listener
    };
  }, [socketRef.current]);

  return <textarea id="realtimeeditor" />;
};
