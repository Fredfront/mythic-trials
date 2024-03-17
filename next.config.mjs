import MillionLint from '@million/lint';
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'cdn.sanity.io'
    }, {
      protocol: 'https',
      hostname: 'render.worldofwarcraft.com'
    }]
  }
};
export default MillionLint.next({
  rsc: true
})(nextConfig);