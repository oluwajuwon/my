import ME from '../../assets/me_hello.PNG';

const NewHome = () => {

  // useEffect(() => {
  //   const t1 = gsap.timeline();
  //   t1.from(".singleLine ", {
  //     y: 190,
  //     ease: "power4.out",
  //     delay: 0,
  //     duration: 1,
  //     stagger: {
  //       amount: 0.2,
  //     },
  //     opacity: 0
  //   });

  //   return () => { };
  // });

  // useEffect(() => {
  //   const t2 = gsap.timeline();
  //   t2.to(".memoji", {
  //     y: 90,
  //     duration: 2,
  //     repeat: 0,
  //     ease: "bounce.out",
  //     opacity: 1

  //   });

  //   return () => { };
  // });

  //bg-gradient-to-r  from-[#be22ff] via-[#ff279c] to-orange-400 
  return (
    <div className='p-4 bg-gray-100'>
      <div className='bg-black p-5 h-screen rounded-[30px] overflow-hidden'>
        <div>

        </div>
        <div className='flex flex-row gap-5'>

          <div className='memoji opacity-1 bg-[#F85149] rounded-3xl w-72 relative'>
            <img src={ME} alt="juwon_memoji" width={250} className='bottom-0 absolute ' />
          </div>
          <div className='flex flex-row items-end bg-[#A5E9FF] rounded-3xl backdrop-blur-sm p-12 w-fit'>
            <div>
              <div className='singleLine overflow-hidden relative opacity-1'>
                <h1 className='inline-block text-transparent bg-clip-text leading-2 text-8xl font-black text-slate-800'>안녕하세요!</h1>
              </div>
              <div className='singleLine overflow-hidden relative opacity-1'>
                <h1 className='inline-block text-transparent bg-clip-text leading-2 text-8xl font-black text-slate-800'>여기 있어요.</h1>
              </div>
              <div className='singleLine overflow-hidden relative opacity-1'>
                <h1 className='inline-block text-transparent bg-clip-text leading-2 text-5xl font-black text-slate-800'>저는 올루와주원입니다.</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewHome;
