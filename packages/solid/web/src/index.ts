import { getNextElement, insert, spread, SVGElements, hydrate as hydrateCore } from "./client.js";
import {
  createSignal,
  createMemo,
  onCleanup,
  untrack,
  splitProps,
  JSX,
  createRoot,
  sharedConfig,
  enableHydration,
  $DEVCOMP,
  ComponentProps,
  ValidComponent,
  createEffect,
  getOwner,
  runWithOwner
} from "solid-js";

export * from "./client.js";

export {
  For,
  Show,
  Suspense,
  SuspenseList,
  Switch,
  Match,
  Index,
  ErrorBoundary,
  mergeProps
} from "solid-js";

export * from "./server-mock.js";

export const isServer: boolean = false;
export const isDev: boolean = "_SOLID_DEV_" as unknown as boolean;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createElement(tagName: string, isSVG = false, is = undefined): HTMLElement | SVGElement {
  return isSVG
    ? document.createElementNS(SVG_NAMESPACE, tagName)
    : document.createElement(tagName, { is });
}

export const hydrate: typeof hydrateCore = (...args) => {
  enableHydration();
  return hydrateCore(...args);
};

/**
 * Hydrates a full document including <html>, <head>, and <body> elements.
 *
 * This function enables hydrating components that return a complete <html> structure.
 * It works by hydrating into document.documentElement and using the existing <html>,
 * <head>, and <body> elements instead of trying to create new ones.
 *
 * @param fn - Component function. For full document hydration, the component should return
 *            the children of <html> (i.e., <head> and <body> elements), not the <html> element itself.
 * @param options - Optional hydration options (renderId, etc.)
 *
 * @example
 * ```tsx
 * // Shared component for both server and client
 * function AppContent() {
 *   return (
 *     <>
 *       <head>
 *         <title>My App</title>
 *         <meta charset="UTF-8" />
 *       </head>
 *       <body>
 *         <div id="root">
 *           <h1>Hello World</h1>
 *         </div>
 *       </body>
 *     </>
 *   );
 * }
 *
 * // Server-side (wraps in <html>)
 * function App() {
 *   return (
 *     <html lang="en">
 *       <AppContent />
 *     </html>
 *   );
 * }
 * const html = renderToString(() => <App />);
 *
 * // Client-side (hydrates content into existing <html>)
 * hydrateDocument(() => <AppContent />);
 * ```
 *
 * Alternatively, if you want to use the same component on both server and client:
 * ```tsx
 * // For server-side rendering
 * const htmlString = renderToString(() => <App />); // Returns full HTML including <html> tags
 *
 * // For client-side hydration into existing document
 * hydrateDocument(() => <App />, { renderId: "app" });
 * ```
 */
export function hydrateDocument(
  fn: () => any,
  options?: { renderId?: string; owner?: unknown }
): () => void {
  enableHydration();

  // Create a wrapper function that handles <html> element extraction
  const wrappedFn = () => {
    const result = fn();

    // If the component returns an <html> element (common when sharing code between server/client),
    // we need to extract its children since we're hydrating into the existing document.documentElement
    if (result && typeof result === 'object' && 'type' in result && result.type === 'html') {
      // Apply attributes from the JSX <html> element to the existing document.documentElement
      // This ensures attributes like lang, dir, etc. are properly set during hydration
      if (result.props) {
        const props = result.props;
        Object.keys(props).forEach(key => {
          if (key !== 'children' && key !== 'ref') {
            const value = props[key];
            if (value != null) {
              // Apply the attribute to the existing html element
              if (key === 'className' || key === 'class') {
                document.documentElement.className = value;
              } else if (typeof value === 'boolean') {
                if (value) {
                  document.documentElement.setAttribute(key, '');
                } else {
                  document.documentElement.removeAttribute(key);
                }
              } else {
                document.documentElement.setAttribute(key, String(value));
              }
            }
          }
        });

        // Extract and return the children
        if (props.children) {
          return props.children;
        }
      }
    }

    return result;
  };

  // Hydrate directly into the documentElement (<html>)
  // The component should return the children of <html> (typically <head> and <body>)
  // or an <html> element (from which we extract the children and apply attributes)
  return hydrateCore(wrappedFn, document.documentElement, options);
}

/**
 * Renders components somewhere else in the DOM
 *
 * Useful for inserting modals and tooltips outside of an cropping layout. If no mount point is given, the portal is inserted in document.body; it is wrapped in a `<div>` unless the target is document.head or `isSVG` is true. setting `useShadow` to true places the element in a shadow root to isolate styles.
 *
 * @description https://docs.solidjs.com/reference/components/portal
 */
export function Portal<T extends boolean = false, S extends boolean = false>(props: {
  mount?: Node;
  useShadow?: T;
  isSVG?: S;
  ref?:
    | (S extends true ? SVGGElement : HTMLDivElement)
    | ((
        el: (T extends true ? { readonly shadowRoot: ShadowRoot } : {}) &
          (S extends true ? SVGGElement : HTMLDivElement)
      ) => void);
  children: JSX.Element;
}) {
  const { useShadow } = props,
    marker = document.createTextNode(""),
    mount = () => props.mount || document.body,
    owner = getOwner();
  let content: undefined | (() => JSX.Element);
  let hydrating = !!sharedConfig.context;

  createEffect(
    () => {
      // basically we backdoor into a sort of renderEffect here
      if (hydrating) (getOwner() as any).user = hydrating = false;
      content || (content = runWithOwner(owner, () => createMemo(() => props.children)));
      const el = mount();
      if (el instanceof HTMLHeadElement) {
        const [clean, setClean] = createSignal(false);
        const cleanup = () => setClean(true);
        createRoot(dispose => insert(el, () => (!clean() ? content!() : dispose()), null));
        onCleanup(cleanup);
      } else {
        const container = createElement(props.isSVG ? "g" : "div", props.isSVG),
          renderRoot =
            useShadow && container.attachShadow
              ? container.attachShadow({ mode: "open" })
              : container;

        Object.defineProperty(container, "_$host", {
          get() {
            return marker.parentNode;
          },
          configurable: true
        });
        insert(renderRoot, content);
        el.appendChild(container);
        props.ref && (props as any).ref(container);
        onCleanup(() => el.removeChild(container));
      }
    },
    undefined,
    { render: !hydrating }
  );
  return marker;
}

export type DynamicProps<T extends ValidComponent, P = ComponentProps<T>> = {
  [K in keyof P]: P[K];
} & {
  component: T | undefined;
};

/**
 * Renders an arbitrary component or element with the given props
 *
 * This is a lower level version of the `Dynamic` component, useful for
 * performance optimizations in libraries. Do not use this unless you know
 * what you are doing.
 * ```typescript
 * const element = () => multiline() ? 'textarea' : 'input';
 * createDynamic(element, { value: value() });
 * ```
 * @description https://docs.solidjs.com/reference/components/dynamic
 */
export function createDynamic<T extends ValidComponent>(
  component: () => T | undefined,
  props: ComponentProps<T>
): JSX.Element {
  const cached = createMemo<Function | string | undefined>(component);
  return createMemo(() => {
    const component = cached();
    switch (typeof component) {
      case "function":
        if (isDev) Object.assign(component, { [$DEVCOMP]: true });
        return untrack(() => component(props));

      case "string":
        const isSvg = SVGElements.has(component);
        const el = sharedConfig.context
          ? getNextElement()
          : createElement(
              component,
              isSvg,
              untrack(() => props.is)
            );
        spread(el, props, isSvg);
        return el;

      default:
        break;
    }
  }) as unknown as JSX.Element;
}

/**
 * Renders an arbitrary custom or native component and passes the other props
 * ```typescript
 * <Dynamic component={multiline() ? 'textarea' : 'input'} value={value()} />
 * ```
 * @description https://docs.solidjs.com/reference/components/dynamic
 */
export function Dynamic<T extends ValidComponent>(props: DynamicProps<T>): JSX.Element {
  const [, others] = splitProps(props, ["component"]);
  return createDynamic(() => props.component, others as ComponentProps<T>);
}
