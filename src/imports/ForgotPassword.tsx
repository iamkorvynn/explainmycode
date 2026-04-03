function Frame() {
  return (
    <div className="absolute content-stretch flex items-start left-[73px] px-[24px] py-[14px] top-[512px]">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-[-4px] pointer-events-none" />
      <button className="block cursor-pointer font-['Noto_Sans:Display_SemiBold_Italic',sans-serif] font-semibold italic leading-[0] relative shrink-0 text-[32px] text-left text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}>
        <p className="leading-[normal]">Take me back.!</p>
      </button>
    </div>
  );
}

function LoginText() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[normal] relative shrink-0 text-white whitespace-nowrap" data-name="Login text">
      <p className="font-['Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[36px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Forgot Password ?
      </p>
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[16px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Please enter you’re email
      </p>
    </div>
  );
}

function Username() {
  return (
    <div className="content-stretch flex items-center px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-[400px]" data-name="Username">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        example@mail.com
      </p>
    </div>
  );
}

function Login() {
  return (
    <div className="content-stretch flex items-center justify-center px-[10px] py-[14px] relative rounded-[12px] shrink-0 w-[400px]" data-darkreader-inline-bgimage data-name="Login" style={{ backgroundImage: "linear-gradient(94.117deg, rgb(233, 72, 197) 9.9097%, rgb(205, 64, 123) 53.286%, rgb(117, 4, 45) 91.559%)", "--darkreader-inline-bgimage": "linear-gradient(94.117deg, var(--darkreader-background-e948c5, #9b137d) 9.9097%, var(--darkreader-background-cd407b, #9b2959) 53.286%, var(--darkreader-background-75042d, #77042e) 91.559%)" } as React.CSSProperties}>
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Reset Password
      </p>
    </div>
  );
}

function LoginBtFp() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0" data-name="Login bt & Fp">
      <Login />
    </div>
  );
}

function Credentials() {
  return (
    <div className="content-stretch flex flex-col gap-[25px] items-start relative shrink-0" data-name="credentials">
      <Username />
      <LoginBtFp />
    </div>
  );
}

function UpperSection() {
  return (
    <div className="content-stretch flex flex-col gap-[14px] items-start relative shrink-0" data-name="Upper Section">
      <LoginText />
      <Credentials />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[47px] items-start relative shrink-0">
      <UpperSection />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>{`Terms & Conditions`}</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Support
      </p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Customer Care
      </p>
    </div>
  );
}

function CustomerCare() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[rgba(98,98,98,0)] items-center justify-between px-[6px] py-[4px] relative rounded-[6px] shrink-0 to-[rgba(98,98,98,0.25)] w-[400px]" data-name="customer care">
      <Frame4 />
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0">
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Don’t have an account ? Signup
      </p>
      <CustomerCare />
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[372px] items-center left-[40px] top-[97px]">
      <Frame2 />
      <Frame7 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-y-1/2 absolute backdrop-blur-[26.5px] h-[796px] right-[60px] rounded-[20px] top-1/2 w-[480px]" data-darkreader-inline-bgimage style={{ backgroundImage: "linear-gradient(-53.097deg, rgba(191, 191, 191, 0.063) 5.9849%, rgba(0, 0, 0, 0) 66.277%), linear-gradient(90deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.14) 100%)", "--darkreader-inline-bgimage": "linear-gradient(-53.097deg, var(--darkreader-background-bfbfbf10, rgba(60, 65, 68, 0.06)) 5.9849%, var(--darkreader-background-00000000, rgba(24, 26, 27, 0)) 66.277%),  linear-gradient(90deg, var(--darkreader-background-00000024, rgba(24, 26, 27, 0.14)) 0%, var(--darkreader-background-00000024, rgba(24, 26, 27, 0.14)) 100%)" } as React.CSSProperties}>
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Frame3 />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[21px] shadow-[-8px_4px_5px_0px_rgba(0,0,0,0.24)]" />
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <div className="bg-[#0f0f0f] relative size-full" data-name="Forgot Password">
      <p className="absolute font-['Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] left-[60px] text-[96px] text-white top-[381px] whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        No Worries.!!
      </p>
      <Frame />
      <div className="absolute left-[798px] size-[302px] top-[62px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302 302">
          <circle cx="151" cy="151" fill="url(#paint0_linear_6_252)" id="Ellipse 1" r="151" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_252" x1="151" x2="151" y1="0" y2="302">
              <stop stopColor="#61003A" />
              <stop offset="1" stopColor="#2D0A30" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute flex items-center justify-center left-[1142px] size-[298.315px] top-[728px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[-28.5deg]">
          <div className="relative size-[220px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="url(#paint0_linear_6_250)" id="Ellipse 2" r="110" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_250" x1="110" x2="110" y1="0" y2="220">
                  <stop stopColor="#61004B" />
                  <stop offset="1" stopColor="#220A30" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <Frame1 />
      <div className="absolute h-0 left-[337px] top-[550px] w-[554px]">
        <div className="absolute inset-[-2px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 554 2">
            <line id="Line 3" stroke="var(--stroke-0, #4D4D4D)" strokeDasharray="12 12" strokeLinecap="round" strokeWidth="2" x1="1" x2="553" y1="1" y2="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}