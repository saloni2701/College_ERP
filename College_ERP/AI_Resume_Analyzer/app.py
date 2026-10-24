import time
import numpy as np
import pandas as pd
import streamlit as st
from streamlit_option_menu import option_menu
from streamlit_extras.add_vertical_space import add_vertical_space
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
from sklearn.metrics.pairwise import cosine_similarity

import warnings
warnings.filterwarnings('ignore')


def streamlit_config():

    st.set_page_config(
        page_title="AI Resume Analyzer",
        page_icon="logo.png",
        layout="wide"
    )

    # Transparent header
    st.markdown("""
        <style>
        [data-testid="stHeader"] {
            background: rgba(0,0,0,0);
        }
        </style>
    """, unsafe_allow_html=True)

    # Logo + Title (aligned)
    col1, col2, col3 = st.columns([0.15, 0.7, 0.15])

    with col2:
        logo_col, text_col = st.columns([0.15, 0.85])
        with logo_col:
            st.image("logo.png", width=130)
        with text_col:
            st.markdown(
                "<h1 style='margin-top: 10px;'>AI Resume Analyzer</h1>",
                unsafe_allow_html=True
            )


@st.cache_resource
def load_summarizer():
    return pipeline("summarization", model="facebook/bart-large-cnn")

def local_ai(chunks, task_type):
    summarizer = load_summarizer()
    resume_text = " ".join(chunks)

    if task_type == "summary":
        prompt = "Summarize this resume:\n" + resume_text

    elif task_type == "strength":
        prompt = "List the strengths of this candidate based on the resume:\n" + resume_text

    elif task_type == "weakness":
        prompt = "Identify weaknesses and suggest improvements for this resume:\n" + resume_text

    elif task_type == "job":
        prompt = "Suggest suitable job roles for this resume:\n" + resume_text

    result = summarizer(
        prompt[:1024],
        max_length=220,
        min_length=90,
        do_sample=False
    )

    return result[0]["summary_text"]

@st.cache_resource
def load_embedder():
    return SentenceTransformer("all-MiniLM-L6-v2")


def calculate_ats_score(resume_chunks, job_description):
    embedder = load_embedder()

    resume_text = " ".join(resume_chunks)

    resume_vec = embedder.encode([resume_text])
    job_vec = embedder.encode([job_description])

    similarity = cosine_similarity(resume_vec, job_vec)[0][0]
    ats_score = round(similarity * 100, 2)

    return ats_score

class resume_analyzer:

    @staticmethod
    def pdf_to_chunks(pdf):
        reader = PdfReader(pdf)
        text = ""
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=700,
            chunk_overlap=200
        )
        return splitter.split_text(text)

    @staticmethod
    def resume_summary():
        pdf = st.file_uploader("Upload Resume", type="pdf")
        if st.button("Generate Summary"):
            if pdf:
                with st.spinner("Analyzing resume..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    output = local_ai(chunks, "summary")
                st.subheader("📝 Resume Summary")
                st.write(output)
            else:
                st.warning("Please upload a resume")

    @staticmethod
    def resume_strength():
        pdf = st.file_uploader("Upload Resume", type="pdf")
        if st.button("Analyze Strengths"):
            if pdf:
                with st.spinner("Analyzing strengths..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    output = local_ai(chunks, "strength")
                st.subheader("💪 Strengths")
                st.write(output)
            else:
                st.warning("Please upload a resume")

    @staticmethod
    def resume_weakness():
        pdf = st.file_uploader("Upload Resume", type="pdf")
        if st.button("Analyze Weakness"):
            if pdf:
                with st.spinner("Analyzing weaknesses..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    output = local_ai(chunks, "weakness")
                st.subheader("⚠️ Weakness & Improvements")
                st.write(output)
            else:
                st.warning("Please upload a resume")

    @staticmethod
    def job_title_suggestion():
        pdf = st.file_uploader("Upload Resume", type="pdf")
        if st.button("Suggest Job Titles"):
            if pdf:
                with st.spinner("Finding suitable roles..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    output = local_ai(chunks, "job")
                st.subheader("🎯 Suggested Job Roles")
                st.write(output)
            else:
                st.warning("Please upload a resume")

    @staticmethod
    def ats_score():
        pdf = st.file_uploader("Upload Resume", type="pdf")
        job_description = st.text_area("Enter Job Description")
        if st.button("Calculate ATS Score"):
            if pdf and job_description:
                with st.spinner("Calculating ATS Score..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    score = calculate_ats_score(chunks, job_description)
                st.subheader("📊 ATS Score")
                st.write(f"**{score}%**")
            else:
                st.warning("Please upload a resume and enter a job description")
    @staticmethod
    def ats_score():

        st.subheader("📊 ATS Resume Score")

        pdf = st.file_uploader("Upload Resume (PDF)", type="pdf")
        job_desc = st.text_area("Paste Job Description")

        if st.button("Calculate ATS Score"):
            if pdf and job_desc.strip():
                with st.spinner("Calculating ATS score..."):
                    chunks = resume_analyzer.pdf_to_chunks(pdf)
                    score = calculate_ats_score(chunks, job_desc)

                st.success(f"✅ ATS Match Score: {score}%")

                if score >= 80:
                    st.markdown("🟢 **Excellent match – highly ATS friendly**")
                elif score >= 60:
                    st.markdown("🟡 **Good match – can be improved**")
                else:
                    st.markdown("🔴 **Low match – needs optimization**")
            else:
                st.warning("Please upload resume and paste job description.")


class linkedin_scraper:

    def webdriver_setup():
            
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        driver = webdriver.Chrome(options=options)
        driver.maximize_window()
        return driver


    def get_userinput():

        add_vertical_space(2)
        with st.form(key='linkedin_scarp'):

            add_vertical_space(1)
            col1,col2,col3 = st.columns([0.5,0.3,0.2], gap='medium')
            with col1:
                job_title_input = st.text_input(label='Job Title')
                job_title_input = job_title_input.split(',')
            with col2:
                job_location = st.text_input(label='Job Location', value='India')
            with col3:
                job_count = st.number_input(label='Job Count', min_value=1, value=1, step=1)

            # Submit Button
            add_vertical_space(1)
            submit = st.form_submit_button(label='Submit')
            add_vertical_space(1)
        
        return job_title_input, job_location, job_count, submit


    def build_url(job_title, job_location):

        b = []
        for i in job_title:
            x = i.split()
            y = '%20'.join(x)
            b.append(y)

        job_title = '%2C%20'.join(b)
        link = f"https://in.linkedin.com/jobs/search?keywords={job_title}&location={job_location}&locationId=&geoId=102713980&f_TPR=r604800&position=1&pageNum=0"

        return link
    

    def open_link(driver, link):

        while True:
            # Break the Loop if the Element is Found, Indicating the Page Loaded Correctly
            try:
                driver.get(link)
                driver.implicitly_wait(5)
                time.sleep(3)
                driver.find_element(by=By.CSS_SELECTOR, value='span.switcher-tabs__placeholder-text.m-auto')
                return
            
            # Retry Loading the Page
            except NoSuchElementException:
                continue


    def link_open_scrolldown(driver, link, job_count):
        
        # Open the Link in LinkedIn
        linkedin_scraper.open_link(driver, link)

        # Scroll Down the Page
        for i in range(0,job_count):

            # Simulate clicking the Page Up button
            body = driver.find_element(by=By.TAG_NAME, value='body')
            body.send_keys(Keys.PAGE_UP)

            # Locate the sign-in modal dialog 
            try:
                driver.find_element(by=By.CSS_SELECTOR, 
                                value="button[data-tracking-control-name='public_jobs_contextual-sign-in-modal_modal_dismiss']>icon>svg").click()
            except:
                pass

            # Scoll down the Page to End
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            driver.implicitly_wait(2)

            # Click on See More Jobs Button if Present
            try:
                x = driver.find_element(by=By.CSS_SELECTOR, value="button[aria-label='See more jobs']").click()
                driver.implicitly_wait(5)
            except:
                pass


    def job_title_filter(scrap_job_title, user_job_title_input):
        
        # User Job Title Convert into Lower Case
        user_input = [i.lower().strip() for i in user_job_title_input]

        # scraped Job Title Convert into Lower Case
        scrap_title = [i.lower().strip() for i in [scrap_job_title]]

        # Verify Any User Job Title in the scraped Job Title
        confirmation_count = 0
        for i in user_input:
            if all(j in scrap_title[0] for j in i.split()):
                confirmation_count += 1

        # Return Job Title if confirmation_count greater than 0 else return NaN
        if confirmation_count > 0:
            return scrap_job_title
        else:
            return np.nan


    def scrap_company_data(driver, job_title_input, job_location):

        # scraping the Company Data
        company = driver.find_elements(by=By.CSS_SELECTOR, value='h4[class="base-search-card__subtitle"]')
        company_name = [i.text for i in company]

        location = driver.find_elements(by=By.CSS_SELECTOR, value='span[class="job-search-card__location"]')
        company_location = [i.text for i in location]

        title = driver.find_elements(by=By.CSS_SELECTOR, value='h3[class="base-search-card__title"]')
        job_title = [i.text for i in title]

        url = driver.find_elements(by=By.XPATH, value='//a[contains(@href, "/jobs/")]')
        website_url = [i.get_attribute('href') for i in url]

        # combine the all data to single dataframe
        df = pd.DataFrame(company_name, columns=['Company Name'])
        df['Job Title'] = pd.DataFrame(job_title)
        df['Location'] = pd.DataFrame(company_location)
        df['Website URL'] = pd.DataFrame(website_url)

        # Return Job Title if there are more than 1 matched word else return NaN
        df['Job Title'] = df['Job Title'].apply(lambda x: linkedin_scraper.job_title_filter(x, job_title_input))

        # Return Location if User Job Location in Scraped Location else return NaN
        df['Location'] = df['Location'].apply(lambda x: x if job_location.lower() in x.lower() else np.nan)
        
        # Drop Null Values and Reset Index
        df = df.dropna()
        df.reset_index(drop=True, inplace=True)

        return df 
        

    def scrap_job_description(driver, df, job_count):
        
        # Get URL into List
        website_url = df['Website URL'].tolist()
        
        # Scrap the Job Description
        job_description = []
        description_count = 0

        for i in range(0, len(website_url)):
            try:
                # Open the Link in LinkedIn
                linkedin_scraper.open_link(driver, website_url[i])

                # Click on Show More Button
                driver.find_element(by=By.CSS_SELECTOR, value='button[data-tracking-control-name="public_jobs_show-more-html-btn"]').click()
                driver.implicitly_wait(5)
                time.sleep(1)

                # Get Job Description
                description = driver.find_elements(by=By.CSS_SELECTOR, value='div[class="show-more-less-html__markup relative overflow-hidden"]')
                data = [i.text for i in description][0]
                
                # Check Description length and Duplicate
                if len(data.strip()) > 0 and data not in job_description:
                    job_description.append(data)
                    description_count += 1
                else:
                    job_description.append('Description Not Available')
            
            # If any unexpected issue 
            except:
                job_description.append('Description Not Available')
            
            # Check Description Count reach User Job Count
            if description_count == job_count:
                break

        # Filter the Job Description
        df = df.iloc[:len(job_description), :]

        # Add Job Description in Dataframe
        df['Job Description'] = pd.DataFrame(job_description, columns=['Description'])
        df['Job Description'] = df['Job Description'].apply(lambda x: np.nan if x=='Description Not Available' else x)
        df = df.dropna()
        df.reset_index(drop=True, inplace=True)
        return df


    def display_data_userinterface(df_final):

        # Display the Data in User Interface
        add_vertical_space(1)
        if len(df_final) > 0:
            for i in range(0, len(df_final)):
                
                st.markdown(f'<h3 style="color: orange;">Job Posting Details : {i+1}</h3>', unsafe_allow_html=True)
                st.write(f"Company Name : {df_final.iloc[i,0]}")
                st.write(f"Job Title    : {df_final.iloc[i,1]}")
                st.write(f"Location     : {df_final.iloc[i,2]}")
                st.write(f"Website URL  : {df_final.iloc[i,3]}")

                with st.expander(label='Job Desription'):
                    st.write(df_final.iloc[i, 4])
                add_vertical_space(3)
        
        else:
            st.markdown(f'<h5 style="text-align: center;color: orange;">No Matching Jobs Found</h5>', 
                                unsafe_allow_html=True)


    def main():
        
        # Initially set driver to None
        driver = None
        
        try:
            job_title_input, job_location, job_count, submit = linkedin_scraper.get_userinput()
            add_vertical_space(2)
            
            if submit:
                if job_title_input != [] and job_location != '':
                    
                    with st.spinner('Chrome Webdriver Setup Initializing...'):
                        driver = linkedin_scraper.webdriver_setup()
                                       
                    with st.spinner('Loading More Job Listings...'):

                        # build URL based on User Job Title Input
                        link = linkedin_scraper.build_url(job_title_input, job_location)

                        # Open the Link in LinkedIn and Scroll Down the Page
                        linkedin_scraper.link_open_scrolldown(driver, link, job_count)

                    with st.spinner('scraping Job Details...'):

                        # Scraping the Company Name, Location, Job Title and URL Data
                        df = linkedin_scraper.scrap_company_data(driver, job_title_input, job_location)

                        # Scraping the Job Descriptin Data
                        df_final = linkedin_scraper. scrap_job_description(driver, df, job_count)
                    
                    # Display the Data in User Interface
                    linkedin_scraper.display_data_userinterface(df_final)

                
                # If User Click Submit Button and Job Title is Empty
                elif job_title_input == []:
                    st.markdown(f'<h5 style="text-align: center;color: orange;">Job Title is Empty</h5>', 
                                unsafe_allow_html=True)
                
                elif job_location == '':
                    st.markdown(f'<h5 style="text-align: center;color: orange;">Job Location is Empty</h5>', 
                                unsafe_allow_html=True)

        except Exception as e:
            add_vertical_space(2)
            st.markdown(f'<h5 style="text-align: center;color: orange;">{e}</h5>', unsafe_allow_html=True)
        
        finally:
            if driver:
                driver.quit()

# Streamlit Configuration Setup
streamlit_config()
add_vertical_space(2)

with st.sidebar:

    # Sidebar Logo
    st.image("logo.png", use_container_width=True)
    st.markdown(
        "<h3 style='text-align:center;'>AI Resume Analyzer</h3>",
        unsafe_allow_html=True
    )

    add_vertical_space(2)

    option = option_menu(
        menu_title='',
        options=[
            'Summary',
            'Strength',
            'Weakness',
            'Job Titles',
            'ATS Score',
            'Linkedin Jobs'
        ],
        icons=[
            'file-text',
            'bar-chart',
            'exclamation-triangle',
            'briefcase',
            'check-circle',
            'linkedin'
        ],
        menu_icon='robot',
        default_index=0
    )

def add_footer():
    st.markdown(
        """
        <style>
        .footer {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            color: #222;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            border-top: 1px solid #e6e6e6;
            z-index: 100;
        }
        </style>

        <div class="footer">
            © 2025 | Developed by <b>Saloni Chauhan, Shambhavi Shukla</b> | SRM University Haryana
        </div>
        """,
        unsafe_allow_html=True
    )

add_footer()

if option == 'Summary':

    resume_analyzer.resume_summary()

elif option == 'Strength':

    resume_analyzer.resume_strength()

elif option == 'Weakness':

    resume_analyzer.resume_weakness()

elif option == 'Job Titles':

    resume_analyzer.job_title_suggestion()

elif option == 'Linkedin Jobs':
    
    linkedin_scraper.main()

elif option == 'ATS Score':
    resume_analyzer.ats_score()




