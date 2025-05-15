export default async () => {
  console.log('Setting up global Jest environment...');
  
  global.__TEST__ = true;
  
  await new Promise(resolve => setTimeout(resolve, 100));
};
