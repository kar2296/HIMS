declare module 'http-test' {
  function http(path: string): string;
  module http { }
  export = http;
}