// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Spinner } from 'flowbite-react';
import  { Suspense } from 'react';


// project imports


// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
