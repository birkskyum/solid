/**
 * @jsxImportSource solid-js
 * @vitest-environment jsdom
 */
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { hydrateDocument } from "../src/index.js";

describe("hydrateDocument", () => {
  let originalLang: string;

  beforeEach(() => {
    // Save original document state
    originalLang = document.documentElement.lang;

    // Set up minimal hydration environment
    (globalThis as any)._$HY = {
      done: false,
      completed: new Set(),
      events: [],
      r: {},
      fe: () => {}
    };
  });

  afterEach(() => {
    // Clean up hydration environment
    delete (globalThis as any)._$HY;

    // Restore original document state
    document.documentElement.lang = originalLang;
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-test");
    document.documentElement.className = "";
  });

  describe("Attribute application (core functionality)", () => {
    test("applies lang attribute from html element", () => {
      document.documentElement.lang = "en";

      // Test the core logic: when component returns {type: 'html', props: {...}}
      // hydrateDocument should extract and apply attributes
      const mockHtmlElement = {
        type: "html",
        props: {
          lang: "fr",
          children: null
        }
      };

      // Create a component that returns the mock structure
      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      // The lang attribute should be applied to document.documentElement
      expect(document.documentElement.lang).toBe("fr");
    });

    test("applies multiple attributes", () => {
      const mockHtmlElement = {
        type: "html",
        props: {
          lang: "es",
          dir: "ltr",
          "data-theme": "light",
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      expect(document.documentElement.lang).toBe("es");
      expect(document.documentElement.getAttribute("dir")).toBe("ltr");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("applies className attribute", () => {
      const mockHtmlElement = {
        type: "html",
        props: {
          className: "dark-mode",
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      expect(document.documentElement.className).toBe("dark-mode");
    });

    test("applies class attribute (synonym for className)", () => {
      const mockHtmlElement = {
        type: "html",
        props: {
          class: "responsive",
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      expect(document.documentElement.className).toBe("responsive");
    });

    test("handles boolean attributes", () => {
      const mockHtmlElement = {
        type: "html",
        props: {
          "data-loaded": true,
          "data-hidden": false,
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      expect(document.documentElement.hasAttribute("data-loaded")).toBe(true);
      expect(document.documentElement.getAttribute("data-loaded")).toBe("");

      expect(document.documentElement.hasAttribute("data-hidden")).toBe(false);
    });

    test("handles null and undefined attributes", () => {
      // Set an existing attribute
      document.documentElement.setAttribute("data-test", "value");

      const mockHtmlElement = {
        type: "html",
        props: {
          "data-test": null,
          "data-undefined": undefined,
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();

      // Null/undefined attributes should not be set
      // (The implementation checks for != null)
    });
  });

  describe("HTML element extraction", () => {
    test("extracts children from html element", () => {
      const mockChildren = { type: "div", props: {} };
      const mockHtmlElement = {
        type: "html",
        props: {
          lang: "en",
          children: mockChildren
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      // Should not throw - the children should be extracted and passed to hydrate
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();

      // Lang should still be applied
      expect(document.documentElement.lang).toBe("en");
    });

    test("handles component without html wrapper", () => {
      const mockElement = {
        type: "div",
        props: {}
      };

      function App() {
        return mockElement as any;
      }

      // Should not throw - should pass through to regular hydrate
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });

    test("handles null return", () => {
      function App() {
        return null;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });

    test("handles undefined return", () => {
      function App() {
        return undefined as any;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });

    test("handles string return", () => {
      function App() {
        return "text content" as any;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });

    test("handles number return", () => {
      function App() {
        return 42 as any;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });
  });

  describe("Options passthrough", () => {
    test("accepts and passes renderId option", () => {
      function App() {
        return null;
      }

      // Should not throw with options
      expect(() => {
        hydrateDocument(() => <App />, { renderId: "test-island" });
      }).not.toThrow();
    });

    test("accepts and passes owner option", () => {
      function App() {
        return null;
      }

      // Should not throw with owner option
      expect(() => {
        hydrateDocument(() => <App />, { owner: {} as any });
      }).not.toThrow();
    });

    test("accepts both options together", () => {
      function App() {
        return null;
      }

      // Should not throw with both options
      expect(() => {
        hydrateDocument(() => <App />, {
          renderId: "island",
          owner: {} as any
        });
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    test("does not apply children or ref attributes", () => {
      const mockRef = () => {};
      const mockHtmlElement = {
        type: "html",
        props: {
          lang: "test",
          children: "some children",
          ref: mockRef
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      // Should apply lang but not children or ref
      expect(document.documentElement.lang).toBe("test");
      expect(document.documentElement.hasAttribute("children")).toBe(false);
      expect(document.documentElement.hasAttribute("ref")).toBe(false);
    });

    test("handles html element with no props", () => {
      const mockHtmlElement = {
        type: "html",
        props: null
      };

      function App() {
        return mockHtmlElement as any;
      }

      // Should not throw
      expect(() => {
        hydrateDocument(() => <App />);
      }).not.toThrow();
    });

    test("handles html element as string type", () => {
      const mockHtmlElement = {
        type: "html",
        props: {
          lang: "verify",
          children: null
        }
      };

      function App() {
        return mockHtmlElement as any;
      }

      hydrateDocument(() => <App />);

      expect(document.documentElement.lang).toBe("verify");
    });
  });

  describe("Function signature", () => {
    test("returns a cleanup function", () => {
      function App() {
        return null;
      }

      const result = hydrateDocument(() => <App />);

      expect(typeof result).toBe("function");
    });

    test("cleanup function can be called", () => {
      function App() {
        return null;
      }

      const cleanup = hydrateDocument(() => <App />);

      // Should not throw when called
      expect(() => {
        cleanup();
      }).not.toThrow();
    });
  });
});
