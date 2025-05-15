export default async () => {
  console.log('Cleaning up global Jest environment...');
  
  if (global.process && typeof global.process.removeAllListeners === 'function') {
    global.process.removeAllListeners();
  }
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  global.__TEST__ = undefined;
};
