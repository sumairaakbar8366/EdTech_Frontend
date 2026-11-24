// Icons are not needed by the logic tests: any icon name is an empty component.
module.exports = new Proxy({ __esModule: true }, { get: (t, name) => (name in t ? t[name] : () => null) });
