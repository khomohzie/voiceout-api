const Default = (title: string, content: string, signature?: string) => {
	return `
  <!DOCTYPE html>
      <html
        lang="en"
        xmlns="http://www.w3.org/1999/xhtml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
      >
        <head>
          <meta charset="UTF-8" />
          <meta http–equiv=“Content-Type” content=“text/html; charset=UTF-8” />
          <meta http–equiv="“X-UA-Compatible”" content="“IE" ="edge”" />
          <meta
            name="“viewport”"
            content="“width"
            ="device-width,"
            initial-scale="1.0"
            “
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta name="color-scheme" content="only" />
          <link
            href="https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
            rel="stylesheet"
            type="text/css"
          />
      
          <title>${title}</title>
      
          <body
            style="
              width: 100%;
              max-width: 768px;
              margin-top: 3rem;
              margin-bottom: 3rem;
              margin-left: auto !important;
              margin-right: auto !important;
              font-family: 'Poppins', sans-serif, 'Roboto';
              font-size: 14px;
              line-height: 1.5;
              color: #151515;
              text-align: left;
              margin-left: auto;
              margin-right: auto;
              box-sizing: border-box;
              -webkit-font-smoothing: antialiased;
              -webkit-text-size-adjust: none;
              background-color: #fbfbfb;
              box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
              border-radius: 0.2rem;
            "
          >
            <main>
              <header
                style="
                  width: 100%;
                  padding: 1.8rem 0rem;
                  border-bottom: 1px solid #eee;
                "
              >
                <img
                  src="https://res.cloudinary.com/shelter-app/image/upload/v1665085521/logo/SRH_png_u8bs28.png"
                  alt="Logo"
                  style="
                    max-height: 75%;
                    object-fit: contain;
                    margin-left: auto;
                    margin-right: auto;
                    display: block;
                  "
                />
              </header>
              <section
                style="
                  color: #6d6d6d;
                  padding: 1.9rem 1.25rem;
                  font-weight: 400;
                  font-size: 14px;
                  line-height: 2;
                  letter-spacing: 0.025em;
                "
              >
                ${content}
                <div style="margin-top: 1rem">
                  <div style="font-weight: 700">Regards,</div>
                  <div>${signature ?? "Shelter"}</div>
                </div>
              </section>
              <footer
                style="
                  color: #6d6d6d;
                  padding: 2.25rem 2rem;
                  border-top: 1px solid #eee;
                  text-align: center;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 1.9;
                  letter-spacing: 0.025em;
                "
              >
                If you have any questions, please contact us at
                <a
                  href="mailto:hello.shelterapp@gmail.com"
                  style="font-weight: 700; text-decoration: none; color: #4a4a4a"
                  >hello.shelterapp@gmail.com</a
                >
                <div style="font-size: 11px">
                  <span>&copy; Shelter. All rights reserved.</span>
                </div>
              </footer>
            </main>
          </body>
        </head>
      </html>
  
    `;
};

const template = {
	default: Default,
};

export default template;
