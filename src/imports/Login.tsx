import svgPaths from "./svg-uvuwjcjnes";

function Frame() {
  return (
    <div className="absolute content-stretch flex items-start left-[82px] px-[24px] py-[14px] top-[512px]">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-[-4px] pointer-events-none" />
      <p className="font-['Noto_Sans:Display_SemiBold_Italic',sans-serif] font-semibold italic leading-[normal] relative shrink-0 text-[32px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 100, 'wdth' 100" }}>
        Skip the lag ?
      </p>
    </div>
  );
}

function LoginText() {
  return (
    <div className="content-stretch flex flex-col items-start leading-[normal] relative shrink-0 text-white whitespace-nowrap" data-name="Login text">
      <p className="font-['Noto_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[36px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Login
      </p>
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium relative shrink-0 text-[16px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Glad you’re back.!
      </p>
    </div>
  );
}

function Username() {
  return (
    <div className="content-stretch flex items-center px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-[400px]" data-name="Username">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Username
      </p>
    </div>
  );
}

function ClosedEye() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="closed eye">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="closed eye">
          <path d={svgPaths.p1d230e00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Password() {
  return (
    <div className="content-stretch flex items-center justify-between px-[16px] py-[14px] relative rounded-[12px] shrink-0 w-[400px]" data-name="Password">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Password
      </p>
      <ClosedEye />
    </div>
  );
}

function FluentCheckboxChecked16Filled() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="fluent:checkbox-checked-16-filled">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="fluent:checkbox-checked-16-filled">
          <path d={svgPaths.pff37800} fill="url(#paint0_linear_6_107)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_107" x1="9" x2="9" y1="2.25" y2="15.75">
            <stop stopColor="#7CC1F3" />
            <stop offset="1" stopColor="#D27EEF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Remember() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Remember">
      <FluentCheckboxChecked16Filled />
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Remember me
      </p>
    </div>
  );
}

function PasswordRem() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Password & Rem">
      <Password />
      <Remember />
    </div>
  );
}

function Login1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[10px] py-[14px] relative rounded-[12px] shrink-0 w-[400px]" data-darkreader-inline-bgimage data-name="Login" style={{ backgroundImage: "linear-gradient(94.117deg, rgb(98, 142, 255) 9.9097%, rgb(135, 64, 205) 53.286%, rgb(88, 4, 117) 91.559%)", "--darkreader-inline-bgimage": "linear-gradient(94.117deg, var(--darkreader-background-628eff, #002991) 9.9097%, var(--darkreader-background-8740cd, #62299b) 53.286%, var(--darkreader-background-580475, #590477) 91.559%)" } as React.CSSProperties}>
      <p className="font-['Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[20px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Login
      </p>
    </div>
  );
}

function LoginBtFp() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0" data-name="Login bt & Fp">
      <Login1 />
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Forgot password ?
      </p>
    </div>
  );
}

function Credentials() {
  return (
    <div className="content-stretch flex flex-col gap-[25px] items-start relative shrink-0" data-name="credentials">
      <Username />
      <PasswordRem />
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

function Or() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0" data-name="Or">
      <div className="h-0 relative shrink-0 w-[170px]">
        <div className="absolute inset-[-2px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 170 2">
            <line id="Line 1" stroke="var(--stroke-0, #4D4D4D)" strokeLinecap="round" strokeWidth="2" x1="1" x2="169" y1="1" y2="1" />
          </svg>
        </div>
      </div>
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#4d4d4d] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Or
      </p>
      <div className="h-0 relative shrink-0 w-[170px]">
        <div className="absolute inset-[-2px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 170 2">
            <line id="Line 2" stroke="var(--stroke-0, #4D4D4D)" strokeLinecap="round" strokeWidth="2" x1="1" x2="169" y1="1" y2="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function DeviconGoogle() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="devicon:google">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g clipPath="url(#clip0_6_93)" id="devicon:google">
          <path d={svgPaths.p17249700} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p6eed480} fill="var(--fill-0, #E33629)" id="Vector_2" />
          <path d={svgPaths.p2051fc00} fill="var(--fill-0, #F8BD00)" id="Vector_3" />
          <path d={svgPaths.p36f9a900} fill="var(--fill-0, #587DBD)" id="Vector_4" />
          <path d={svgPaths.p4fd1480} fill="var(--fill-0, #319F43)" id="Vector_5" />
        </g>
        <defs>
          <clipPath id="clip0_6_93">
            <rect fill="white" height="42" width="42" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function LogosFacebook() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="logos:facebook">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g clipPath="url(#clip0_6_112)" id="logos:facebook">
          <path d={svgPaths.p17708a00} fill="var(--fill-0, #1877F2)" id="Vector" />
          <path d={svgPaths.p984ba00} fill="var(--fill-0, white)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_6_112">
            <rect fill="white" height="42" width="42" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function BiGithub() {
  return (
    <div className="relative shrink-0 size-[42px]" data-name="bi:github">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
        <g id="bi:github">
          <path d={svgPaths.p18209680} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[18px] items-center justify-center relative shrink-0">
      <DeviconGoogle />
      <LogosFacebook />
      <BiGithub />
    </div>
  );
}

function OtherLogins() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0" data-name="Other logins">
      <Or />
      <Frame2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[47px] items-start relative shrink-0">
      <UpperSection />
      <OtherLogins />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>{`Terms & Conditions`}</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0">
      <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Support
      </p>
    </div>
  );
}

function Frame7() {
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
    <div className="bg-gradient-to-b content-stretch flex from-[rgba(98,98,98,0)] items-center justify-between px-[6px] py-[4px] relative rounded-[6px] shrink-0 to-[rgba(98,98,98,0.07)] w-[400px]" data-name="customer care">
      <Frame5 />
      <Frame6 />
      <Frame7 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0">
      <p className="font-['Noto_Sans:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[16px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Don’t have an account ? Signup
      </p>
      <CustomerCare />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[101px] items-center left-[40px] top-[97px]">
      <Frame3 />
      <Frame8 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-y-1/2 absolute backdrop-blur-[26.5px] h-[796px] right-[60px] rounded-[20px] top-1/2 w-[480px]" data-darkreader-inline-bgimage style={{ backgroundImage: "linear-gradient(-53.097deg, rgba(191, 191, 191, 0.063) 5.9849%, rgba(0, 0, 0, 0) 66.277%), linear-gradient(90deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.14) 100%)", "--darkreader-inline-bgimage": "linear-gradient(-53.097deg, var(--darkreader-background-bfbfbf10, rgba(60, 65, 68, 0.06)) 5.9849%, var(--darkreader-background-00000000, rgba(24, 26, 27, 0)) 66.277%),  linear-gradient(90deg, var(--darkreader-background-00000024, rgba(24, 26, 27, 0.14)) 0%, var(--darkreader-background-00000024, rgba(24, 26, 27, 0.14)) 100%)" } as React.CSSProperties}>
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Frame4 />
      </div>
      <div aria-hidden="true" className="absolute border border-solid border-white inset-[-1px] pointer-events-none rounded-[21px] shadow-[-8px_4px_5px_0px_rgba(0,0,0,0.24)]" />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-[#0f0f0f] relative size-full" data-name="Login">
      <p className="absolute font-['Noto_Sans:SemiBold',sans-serif] font-semibold leading-[normal] left-[60px] text-[96px] text-white top-[381px] whitespace-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
        Welcome Back .!
      </p>
      <Frame />
      <div className="absolute left-[749px] size-[302px] top-[81px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302 302">
          <circle cx="151" cy="151" fill="url(#paint0_linear_6_116)" id="Ellipse 1" r="151" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_116" x1="151" x2="151" y1="0" y2="302">
              <stop stopColor="#530061" />
              <stop offset="1" stopColor="#0D0A30" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute flex items-center justify-center left-[1169.84px] size-[298.315px] top-[719.84px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "22" } as React.CSSProperties}>
        <div className="flex-none rotate-[-28.5deg]">
          <div className="relative size-[220px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="url(#paint0_linear_6_110)" id="Ellipse 2" r="110" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_6_110" x1="110" x2="110" y1="0" y2="220">
                  <stop stopColor="#300061" />
                  <stop offset="1" stopColor="#0A1030" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <Frame1 />
      <div className="absolute h-0 left-[330px] top-[550px] w-[561px]">
        <div className="absolute inset-[-2px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 561 2">
            <line id="Line 3" stroke="var(--stroke-0, #4D4D4D)" strokeDasharray="12 12" strokeLinecap="round" strokeWidth="2" x1="1" x2="560" y1="1" y2="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}