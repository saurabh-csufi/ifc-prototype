import type { IndicatorConfig, FilterState } from '../types';

// ===== Source strings =====
const AISHE_SOURCE = 'All India Survey on Higher Education (AISHE), Ministry of Education';
const UDISE_SOURCE = 'UDISE+, Department of School Education & Literacy';
const NSS80_SOURCE = 'NSS 80th Round, Ministry of Statistics & Programme Implementation';

// ===== Helper: build a resolver for indicators with no filters =====
function singleStatVar(statVar: string) {
  return (_filters: FilterState): string[] => [statVar];
}

// ===== Indicator Definitions =====

export const INDICATORS: IndicatorConfig[] = [
  // ---------------------------------------------------------------------------
  // 1. AISHE - Number of Colleges over the years
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_colleges_count',
    name: 'Number of Colleges over the years',
    dataset: 'AISHE',
    chartType: 'line',
    filters: [],
    statVars: ['AISHE_Colleges_Count'],
    resolveStatVars: singleStatVar('AISHE_Colleges_Count'),
    views: [
      { chartType: 'line', label: 'Line', filters: [] },
      { chartType: 'area', label: 'Area', filters: [] },
      { chartType: 'pie', label: 'Pie', filters: [] },
    ],
    source: AISHE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 2. AISHE - Number of Teachers by faculty type
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_teachers_by_faculty',
    name: 'Number of Teachers by faculty type (over the years) in higher education',
    dataset: 'AISHE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'facultyType',
        label: 'Faculty Type',
        options: [
          { value: 'Demonstratortutor', label: 'Demonstrator/Tutor' },
          { value: 'LecturerassistantProfessor', label: 'Lecturer/Assistant Professor' },
          { value: 'ProfessorEquivalent', label: 'Professor Equivalent' },
          { value: 'ReaderAssociateProfessor', label: 'Reader/Associate Professor' },
          { value: 'TemporaryTeacherEtc', label: 'Temporary Teacher' },
          { value: 'Total', label: 'Total' },
          { value: 'VisitingTeacher', label: 'Visiting Teacher' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'AISHE_Teachers_Demonstratortutor_Female',
      'AISHE_Teachers_Demonstratortutor_Male',
      'AISHE_Teachers_Demonstratortutor_Total',
      'AISHE_Teachers_LecturerassistantProfessor_Female',
      'AISHE_Teachers_LecturerassistantProfessor_Male',
      'AISHE_Teachers_LecturerassistantProfessor_Total',
      'AISHE_Teachers_ProfessorEquivalent_Female',
      'AISHE_Teachers_ProfessorEquivalent_Male',
      'AISHE_Teachers_ProfessorEquivalent_Total',
      'AISHE_Teachers_ReaderAssociateProfessor_Female',
      'AISHE_Teachers_ReaderAssociateProfessor_Male',
      'AISHE_Teachers_ReaderAssociateProfessor_Total',
      'AISHE_Teachers_TemporaryTeacherEtc_Female',
      'AISHE_Teachers_TemporaryTeacherEtc_Male',
      'AISHE_Teachers_TemporaryTeacherEtc_Total',
      'AISHE_Teachers_Total_Female',
      'AISHE_Teachers_Total_Male',
      'AISHE_Teachers_Total_Total',
      'AISHE_Teachers_VisitingTeacher_Female',
      'AISHE_Teachers_VisitingTeacher_Male',
      'AISHE_Teachers_VisitingTeacher_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const facultyType = filters.facultyType || 'Total';
      const gender = filters.gender || 'Total';
      return [`AISHE_Teachers_${facultyType}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'facultyType', multiSelect: false }] },
      { chartType: 'area', label: 'Area', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'facultyType', multiSelect: false }] },
      { chartType: 'pie', label: 'Pie', colorByLabel: 'Faculty Type', filters: [{ filterId: 'facultyType', multiSelect: true }, { filterId: 'gender', multiSelect: false }] },
    ],
    source: AISHE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 3. AISHE - Number of Universities over the years
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_universities_count',
    name: 'Number of Universities over the years',
    dataset: 'AISHE',
    chartType: 'line',
    filters: [],
    statVars: ['AISHE_Universities_Count'],
    resolveStatVars: singleStatVar('AISHE_Universities_Count'),
    views: [
      { chartType: 'line', label: 'Line', filters: [] },
      { chartType: 'scatter', label: 'Circle', filters: [] },
      { chartType: 'area', label: 'Area', filters: [] },
    ],
    source: AISHE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 4. AISHE - Mode of Education wise Pupil Teacher Ratio (PTR)
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_ptr_by_institution_mode',
    name: 'Mode of Education wise Pupil Teacher Ratio (PTR) by instutuition type and learning mode',
    dataset: 'AISHE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'institutionType',
        label: 'Institution Type',
        options: [
          { value: 'Total', label: 'Total' },
          { value: 'UniversityColleges', label: 'University Colleges' },
          { value: 'UniversityItsConstituentUnits', label: 'University & Constituent Units' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'mode',
        label: 'Learning Mode',
        options: [
          { value: 'Regular', label: 'Regular' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'AISHE_PTR_Total_Regular',
      'AISHE_PTR_Total_Total',
      'AISHE_PTR_UniversityColleges_Regular',
      'AISHE_PTR_UniversityColleges_Total',
      'AISHE_PTR_UniversityItsConstituentUnits_Regular',
      'AISHE_PTR_UniversityItsConstituentUnits_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const institutionType = filters.institutionType || 'Total';
      const mode = filters.mode || 'Total';
      return [`AISHE_PTR_${institutionType}_${mode}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'institutionType', multiSelect: true }, { filterId: 'mode', multiSelect: false }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Institution Type', filters: [{ filterId: 'mode', multiSelect: false }, { filterId: 'institutionType', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', colorByLabel: 'Year', filters: [{ filterId: 'mode', multiSelect: true }, { filterId: 'institutionType', multiSelect: false }] },
    ],
    source: AISHE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 5. AISHE - Social Group wise Gross Enrolment Ratio (GER)
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_ger_social_group',
    name: 'Social Group wise Gross Enrolment Ratio (GER)',
    dataset: 'AISHE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'socialGroup',
        label: 'Social Group',
        options: [
          { value: 'ScheduledCaste', label: 'Scheduled Caste' },
          { value: 'ScheduledTribe', label: 'Scheduled Tribe' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'AISHE_GER_ScheduledCaste_Female',
      'AISHE_GER_ScheduledCaste_Male',
      'AISHE_GER_ScheduledCaste_Total',
      'AISHE_GER_ScheduledTribe_Female',
      'AISHE_GER_ScheduledTribe_Male',
      'AISHE_GER_ScheduledTribe_Total',
      'AISHE_GER_Total_Female',
      'AISHE_GER_Total_Male',
      'AISHE_GER_Total_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const socialGroup = filters.socialGroup || 'Total';
      const gender = filters.gender || 'Total';
      return [`AISHE_GER_${socialGroup}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'socialGroup', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Gender', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'socialGroup', multiSelect: false }] },
      { chartType: 'lollipop', label: 'Lollipop', colorByLabel: 'Gender', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'socialGroup', multiSelect: false }] },
    ],
    source: AISHE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 6. AISHE - Estimated Student Enrolment in Higher Education
  // ---------------------------------------------------------------------------
  {
    id: 'aishe_enrolment_higher_education',
    name: 'Estimated Student Enrolment in Higher Education (Across education level and gender)',
    dataset: 'AISHE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'category',
        label: 'Education Level / Social Group',
        options: [
          { value: 'Certificate', label: 'Certificate' },
          { value: 'Diploma', label: 'Diploma' },
          { value: 'Ews', label: 'EWS' },
          { value: 'Integrated', label: 'Integrated' },
          { value: 'Mphil', label: 'M.Phil' },
          { value: 'OtherBackwardClasses', label: 'Other Backward Classes' },
          { value: 'PersonsWithDisability', label: 'Persons with Disability' },
          { value: 'PgDiploma', label: 'PG Diploma' },
          { value: 'Phd', label: 'Ph.D' },
          { value: 'PostGraduate', label: 'Post Graduate' },
          { value: 'ScheduledCaste', label: 'Scheduled Caste' },
          { value: 'ScheduledTribe', label: 'Scheduled Tribe' },
          { value: 'Total', label: 'Total' },
          { value: 'UnderGraduate', label: 'Under Graduate' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'AISHE_Enrolment_Certificate_Female',
      'AISHE_Enrolment_Certificate_Male',
      'AISHE_Enrolment_Certificate_Total',
      'AISHE_Enrolment_Diploma_Female',
      'AISHE_Enrolment_Diploma_Male',
      'AISHE_Enrolment_Diploma_Total',
      'AISHE_Enrolment_Ews_Female',
      'AISHE_Enrolment_Ews_Male',
      'AISHE_Enrolment_Ews_Total',
      'AISHE_Enrolment_Integrated_Female',
      'AISHE_Enrolment_Integrated_Male',
      'AISHE_Enrolment_Integrated_Total',
      'AISHE_Enrolment_Mphil_Female',
      'AISHE_Enrolment_Mphil_Male',
      'AISHE_Enrolment_Mphil_Total',
      'AISHE_Enrolment_OtherBackwardClasses_Female',
      'AISHE_Enrolment_OtherBackwardClasses_Male',
      'AISHE_Enrolment_OtherBackwardClasses_Total',
      'AISHE_Enrolment_PersonsWithDisability_Female',
      'AISHE_Enrolment_PersonsWithDisability_Male',
      'AISHE_Enrolment_PersonsWithDisability_Total',
      'AISHE_Enrolment_PgDiploma_Female',
      'AISHE_Enrolment_PgDiploma_Male',
      'AISHE_Enrolment_PgDiploma_Total',
      'AISHE_Enrolment_Phd_Female',
      'AISHE_Enrolment_Phd_Male',
      'AISHE_Enrolment_Phd_Total',
      'AISHE_Enrolment_PostGraduate_Female',
      'AISHE_Enrolment_PostGraduate_Male',
      'AISHE_Enrolment_PostGraduate_Total',
      'AISHE_Enrolment_ScheduledCaste_Female',
      'AISHE_Enrolment_ScheduledCaste_Male',
      'AISHE_Enrolment_ScheduledCaste_Total',
      'AISHE_Enrolment_ScheduledTribe_Female',
      'AISHE_Enrolment_ScheduledTribe_Male',
      'AISHE_Enrolment_ScheduledTribe_Total',
      'AISHE_Enrolment_Total_Female',
      'AISHE_Enrolment_Total_Male',
      'AISHE_Enrolment_Total_Total',
      'AISHE_Enrolment_UnderGraduate_Female',
      'AISHE_Enrolment_UnderGraduate_Male',
      'AISHE_Enrolment_UnderGraduate_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const category = filters.category || 'Total';
      const gender = filters.gender || 'Total';
      return [`AISHE_Enrolment_${category}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'category', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Education Level', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'category', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', colorByLabel: 'Education Level', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'category', multiSelect: true }] },
    ],
    source: AISHE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 7. UDISE - Children With Special Needs (CWSN) enrolment
  // ---------------------------------------------------------------------------
  {
    id: 'udise_cwsn_enrolment',
    name: 'Children With Special Needs (CWSN) enrolment',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'PrimaryToHigherSecondary', label: 'Primary to Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Total', label: 'Total' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Enrolment_CWSN_Elementary_Boys',
      'UDISE_Enrolment_CWSN_Elementary_Girls',
      'UDISE_Enrolment_CWSN_Elementary_Total',
      'UDISE_Enrolment_CWSN_HigherSecondary_Boys',
      'UDISE_Enrolment_CWSN_HigherSecondary_Girls',
      'UDISE_Enrolment_CWSN_HigherSecondary_Total',
      'UDISE_Enrolment_CWSN_PrePrimary_Boys',
      'UDISE_Enrolment_CWSN_PrePrimary_Girls',
      'UDISE_Enrolment_CWSN_PrePrimary_Total',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Boys',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Girls',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Total',
      'UDISE_Enrolment_CWSN_Primary_Boys',
      'UDISE_Enrolment_CWSN_Primary_Girls',
      'UDISE_Enrolment_CWSN_Primary_Total',
      'UDISE_Enrolment_CWSN_Secondary_Boys',
      'UDISE_Enrolment_CWSN_Secondary_Girls',
      'UDISE_Enrolment_CWSN_Secondary_Total',
      'UDISE_Enrolment_CWSN_Total_Boys',
      'UDISE_Enrolment_CWSN_Total_Girls',
      'UDISE_Enrolment_CWSN_Total_Total',
      'UDISE_Enrolment_CWSN_UpperPrimary_Boys',
      'UDISE_Enrolment_CWSN_UpperPrimary_Girls',
      'UDISE_Enrolment_CWSN_UpperPrimary_Total',
      'UDISE_Schools_Facilities_CWSNToilet_Government',
      'UDISE_Schools_Facilities_CWSNToilet_GovernmentAided',
      'UDISE_Schools_Facilities_CWSNToilet_Others',
      'UDISE_Schools_Facilities_CWSNToilet_PrivateUnaidedRecognized',
      'UDISE_Schools_Facilities_CWSNToilet_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Total';
      const gender = filters.gender || 'Total';
      return [`UDISE_Enrolment_CWSN_${level}_${gender}`];
    },
    views: [
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 8. UDISE - Dropout Rate
  // ---------------------------------------------------------------------------
  {
    id: 'udise_dropout_rate',
    name: 'Dropout Rate',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_DropoutRate_Primary_Boys',
      'UDISE_DropoutRate_Primary_Girls',
      'UDISE_DropoutRate_Primary_Total',
      'UDISE_DropoutRate_Secondary_Boys',
      'UDISE_DropoutRate_Secondary_Girls',
      'UDISE_DropoutRate_Secondary_Total',
      'UDISE_DropoutRate_UpperPrimary_Boys',
      'UDISE_DropoutRate_UpperPrimary_Girls',
      'UDISE_DropoutRate_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_DropoutRate_${level}_${gender}`];
    },
    views: [
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 9. UDISE - Gross Enrolment Ratio (GER)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_ger',
    name: 'Gross Enrolment Ratio (GER)',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'socialGroup',
        label: 'Social Group',
        options: [
          { value: 'Sc', label: 'Scheduled Caste' },
          { value: 'St', label: 'Scheduled Tribe' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_GER_Elementary_Sc_Boys',
      'UDISE_GER_Elementary_Sc_Girls',
      'UDISE_GER_Elementary_Sc_Total',
      'UDISE_GER_Elementary_St_Boys',
      'UDISE_GER_Elementary_St_Girls',
      'UDISE_GER_Elementary_St_Total',
      'UDISE_GER_Elementary_Total_Boys',
      'UDISE_GER_Elementary_Total_Girls',
      'UDISE_GER_Elementary_Total_Total',
      'UDISE_GER_HigherSecondary_Sc_Boys',
      'UDISE_GER_HigherSecondary_Sc_Girls',
      'UDISE_GER_HigherSecondary_Sc_Total',
      'UDISE_GER_HigherSecondary_St_Boys',
      'UDISE_GER_HigherSecondary_St_Girls',
      'UDISE_GER_HigherSecondary_St_Total',
      'UDISE_GER_HigherSecondary_Total_Boys',
      'UDISE_GER_HigherSecondary_Total_Girls',
      'UDISE_GER_HigherSecondary_Total_Total',
      'UDISE_GER_Primary_Sc_Boys',
      'UDISE_GER_Primary_Sc_Girls',
      'UDISE_GER_Primary_Sc_Total',
      'UDISE_GER_Primary_St_Boys',
      'UDISE_GER_Primary_St_Girls',
      'UDISE_GER_Primary_St_Total',
      'UDISE_GER_Primary_Total_Boys',
      'UDISE_GER_Primary_Total_Girls',
      'UDISE_GER_Primary_Total_Total',
      'UDISE_GER_Secondary_Sc_Boys',
      'UDISE_GER_Secondary_Sc_Girls',
      'UDISE_GER_Secondary_Sc_Total',
      'UDISE_GER_Secondary_St_Boys',
      'UDISE_GER_Secondary_St_Girls',
      'UDISE_GER_Secondary_St_Total',
      'UDISE_GER_Secondary_Total_Boys',
      'UDISE_GER_Secondary_Total_Girls',
      'UDISE_GER_Secondary_Total_Total',
      'UDISE_GER_UpperPrimary_Sc_Boys',
      'UDISE_GER_UpperPrimary_Sc_Girls',
      'UDISE_GER_UpperPrimary_Sc_Total',
      'UDISE_GER_UpperPrimary_St_Boys',
      'UDISE_GER_UpperPrimary_St_Girls',
      'UDISE_GER_UpperPrimary_St_Total',
      'UDISE_GER_UpperPrimary_Total_Boys',
      'UDISE_GER_UpperPrimary_Total_Girls',
      'UDISE_GER_UpperPrimary_Total_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const socialGroup = filters.socialGroup || 'Total';
      const gender = filters.gender || 'Total';
      return [`UDISE_GER_${level}_${socialGroup}_${gender}`];
    },
    views: [
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'horizontalBar', label: 'By Social Group', colorByLabel: 'Social Group', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'socialGroup', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 10. UDISE - Net Enrolment Rate (NER)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_ner',
    name: 'Net Enrolment Rate (NER)',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_NER_Elementary_Boys',
      'UDISE_NER_Elementary_Girls',
      'UDISE_NER_Elementary_Total',
      'UDISE_NER_HigherSecondary_Boys',
      'UDISE_NER_HigherSecondary_Girls',
      'UDISE_NER_HigherSecondary_Total',
      'UDISE_NER_Primary_Boys',
      'UDISE_NER_Primary_Girls',
      'UDISE_NER_Primary_Total',
      'UDISE_NER_Secondary_Boys',
      'UDISE_NER_Secondary_Girls',
      'UDISE_NER_Secondary_Total',
      'UDISE_NER_UpperPrimary_Boys',
      'UDISE_NER_UpperPrimary_Girls',
      'UDISE_NER_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_NER_${level}_${gender}`];
    },
    views: [
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 11. UDISE - Percentage of Trained Teachers (All Management)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_trained_teachers_percentage',
    name: 'Percentage of Trained Teachers (All Management)',
    dataset: 'UDISE',
    chartType: 'bar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_TrainedTeachers_Percentage_HigherSecondary_Total',
      'UDISE_TrainedTeachers_Percentage_PrePrimary_Total',
      'UDISE_TrainedTeachers_Percentage_Primary_Total',
      'UDISE_TrainedTeachers_Percentage_Secondary_Total',
      'UDISE_TrainedTeachers_Percentage_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      return [`UDISE_TrainedTeachers_Percentage_${level}_Total`];
    },
    views: [
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'level', multiSelect: true }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', filters: [{ filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Education Level', filters: [{ filterId: 'level', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 12. UDISE - Number of Books available in Library per School
  // ---------------------------------------------------------------------------
  {
    id: 'udise_library_books_per_school',
    name: 'Number of Books available in Library/Book Bank/Reading Corner per School',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [],
    statVars: ['UDISE_LibraryBooks_PerSchool'],
    resolveStatVars: singleStatVar('UDISE_LibraryBooks_PerSchool'),
    views: [
      { chartType: 'line', label: 'Line', filters: [] },
      { chartType: 'bar', label: 'Bar', filters: [] },
      { chartType: 'scatter', label: 'Dot', filters: [] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 13. UDISE - Number of schools by level of school education
  // ---------------------------------------------------------------------------
  {
    id: 'udise_schools_by_level',
    name: 'Number of schools by level of school education',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_Schools_Count_HigherSecondary',
      'UDISE_Schools_Count_Primary',
      'UDISE_Schools_Count_Secondary',
      'UDISE_Schools_Count_UpperPrimary',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      return [`UDISE_Schools_Count_${level}`];
    },
    views: [
      { chartType: 'pie', label: 'Pie', colorByLabel: 'Level of Education', filters: [] },
      { chartType: 'treemap', label: 'Treemap', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 14. UDISE - Number of schools by management and school category
  // ---------------------------------------------------------------------------
  {
    id: 'udise_schools_by_management_category',
    name: 'Number of schools by management and school category',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
        ],
        defaultValue: 'Government',
      },
      {
        id: 'level',
        label: 'School Category',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_Schools_Count_Government_HigherSecondary',
      'UDISE_Schools_Count_Government_Primary',
      'UDISE_Schools_Count_Government_Secondary',
      'UDISE_Schools_Count_Government_UpperPrimary',
      'UDISE_Schools_Count_GovernmentAided_HigherSecondary',
      'UDISE_Schools_Count_GovernmentAided_Primary',
      'UDISE_Schools_Count_GovernmentAided_Secondary',
      'UDISE_Schools_Count_GovernmentAided_UpperPrimary',
      'UDISE_Schools_Count_Others_HigherSecondary',
      'UDISE_Schools_Count_Others_Primary',
      'UDISE_Schools_Count_Others_Secondary',
      'UDISE_Schools_Count_Others_UpperPrimary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_HigherSecondary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_Primary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_Secondary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_UpperPrimary',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const management = filters.management || 'Government';
      const level = filters.level || 'Primary';
      return [`UDISE_Schools_Count_${management}_${level}`];
    },
    views: [
      { chartType: 'treemap', label: 'Treemap', colorByLabel: 'Management', filters: [{ filterId: 'level', multiSelect: false }, { filterId: 'management', multiSelect: false }] },
      { chartType: 'stackedBar', label: 'Stacked Bar', colorByLabel: 'Management', filters: [{ filterId: 'level', multiSelect: true }, { filterId: 'management', multiSelect: false }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Management', filters: [{ filterId: 'level', multiSelect: false }, { filterId: 'management', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 15. NSS80 - Percentage of students reported expenditure on course fees by level
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_expenditure_course_fee_by_level',
    name: 'Percentage of students reported expenditure on course fees by level of current enrolment',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Middle', label: 'Middle' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'All', label: 'All (Person)' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
    ],
    statVars: [
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Female',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Female_Rural',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Female_Urban',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Male',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Male_Rural',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Male_Urban',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Rural',
      'NSS80_Expenditure_ReportedCourseFee_HigherSecondary_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Female',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Female_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Female_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Male',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Male_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Male_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Middle',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Middle_Urban',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Female',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Female_Rural',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Female_Urban',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Male',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Male_Rural',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Male_Urban',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Rural',
      'NSS80_Expenditure_ReportedCourseFee_PrePrimary_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Female',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Female_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Female_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Male',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Male_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Male_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Primary',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Primary_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Female',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Female_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Female_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Male',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Male_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Male_Urban',
      'NSS80_Expenditure_ReportedCourseFee_Secondary',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Rural',
      'NSS80_Expenditure_ReportedCourseFee_Secondary_Urban',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'All';
      const sector = filters.sector || 'All';
      // Pattern: NSS80_Expenditure_ReportedCourseFee_{Level}[_{Gender}][_{Sector}]
      // When gender=All and sector=All -> NSS80_Expenditure_ReportedCourseFee_{Level}
      // When gender=specific and sector=All -> NSS80_Expenditure_ReportedCourseFee_{Level}_{Gender}
      // When gender=All and sector=specific -> NSS80_Expenditure_ReportedCourseFee_{Level}_{Sector}
      // When gender=specific and sector=specific -> NSS80_Expenditure_ReportedCourseFee_{Level}_{Gender}_{Sector}
      let statVar = `NSS80_Expenditure_ReportedCourseFee_${level}`;
      if (gender !== 'All') {
        statVar += `_${gender}`;
      }
      if (sector !== 'All') {
        statVar += `_${sector}`;
      }
      return [statVar];
    },
    views: [
      { chartType: 'lollipop', label: 'Lollipop', colorByLabel: 'Gender', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Sector', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
      { chartType: 'butterfly', label: 'Butterfly', colorByLabel: 'Sector', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 16. NSS80 - Percentage of students reported expenditure on course fees by type of school
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_expenditure_course_fee_by_school_type',
    name: 'Percentage of students reported expenditure on course fees by type of school',
    dataset: 'NSS80',
    chartType: 'bar',
    filters: [
      {
        id: 'schoolType',
        label: 'School Type',
        options: [
          { value: 'SchoolTypeAllNonGovernment', label: 'All Non-Government' },
          { value: 'SchoolTypeGovernment', label: 'Government' },
          { value: 'SchoolTypeOthers', label: 'Others' },
          { value: 'SchoolTypePrivateAided', label: 'Private Aided' },
          { value: 'SchoolTypePrivateUnaided', label: 'Private Unaided' },
        ],
        defaultValue: 'SchoolTypeGovernment',
      },
    ],
    statVars: [
      'NSS80_Expenditure_ReportedCourseFee_SchoolTypeAllNonGovernment',
      'NSS80_Expenditure_ReportedCourseFee_SchoolTypeGovernment',
      'NSS80_Expenditure_ReportedCourseFee_SchoolTypeOthers',
      'NSS80_Expenditure_ReportedCourseFee_SchoolTypePrivateAided',
      'NSS80_Expenditure_ReportedCourseFee_SchoolTypePrivateUnaided',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const schoolType = filters.schoolType || 'SchoolTypeGovernment';
      return [`NSS80_Expenditure_ReportedCourseFee_${schoolType}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Gender', filters: [{ filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', colorByLabel: 'Sector', filters: [{ filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Comparison', filters: [{ filterId: 'schoolType', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 17. NSS80 - Average expenditure per student by level of current enrolment
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_avg_expenditure_per_student_by_level',
    name: 'Average expenditure (Rs.) per student on school education by level of current enrolment',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Middle', label: 'Middle' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'schoolType',
        label: 'School Type',
        options: [
          { value: 'SchoolTypeGovernment', label: 'Government' },
          { value: 'SchoolTypeOthers', label: 'Others' },
          { value: 'SchoolTypePrivateAided', label: 'Private Aided' },
          { value: 'SchoolTypePrivateUnaided', label: 'Private Unaided' },
        ],
        defaultValue: 'SchoolTypeGovernment',
      },
    ],
    statVars: [
      'NSS80_Expenditure_AveragePerStudent_Middle_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Middle_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Middle_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Middle_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Middle_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Middle_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Middle_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Middle_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Middle_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Middle_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Middle_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Middle_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_PrePrimary_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Primary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Primary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Primary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Primary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Primary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Primary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Primary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Primary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Primary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Primary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Primary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Primary_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Secondary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Secondary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Secondary_Urban_SchoolTypePrivateUnaided',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const sector = filters.sector || 'All';
      const schoolType = filters.schoolType || 'SchoolTypeGovernment';
      // Pattern: NSS80_Expenditure_AveragePerStudent_{Level}[_{Sector}]_{SchoolType}
      if (sector === 'All') {
        return [`NSS80_Expenditure_AveragePerStudent_${level}_${schoolType}`];
      }
      return [`NSS80_Expenditure_AveragePerStudent_${level}_${sector}_${schoolType}`];
    },
    views: [
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'heatmap', label: 'Heatmap', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 18. NSS80 - Average expenditure per student by type of school
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_avg_expenditure_per_student_by_school_type',
    name: 'Average expenditure (Rs.) per student on school education by type of school',
    dataset: 'NSS80',
    chartType: 'bar',
    filters: [
      {
        id: 'schoolType',
        label: 'School Type',
        options: [
          { value: 'SchoolTypeAllNonGovernment', label: 'All Non-Government' },
          { value: 'SchoolTypeGovernment', label: 'Government' },
          { value: 'SchoolTypeOthers', label: 'Others' },
          { value: 'SchoolTypePrivateAided', label: 'Private Aided' },
          { value: 'SchoolTypePrivateUnaided', label: 'Private Unaided' },
        ],
        defaultValue: 'SchoolTypeGovernment',
      },
    ],
    statVars: [
      'NSS80_Expenditure_AveragePerStudent_SchoolTypeAllNonGovernment',
      'NSS80_Expenditure_AveragePerStudent_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_SchoolTypePrivateUnaided',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const schoolType = filters.schoolType || 'SchoolTypeGovernment';
      return [`NSS80_Expenditure_AveragePerStudent_${schoolType}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'heatmap', label: 'Heatmap', filters: [{ filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'schoolType', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 19. NSS80 - Average expenditure per student during current academic year
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_avg_expenditure_per_student_current_year',
    name: 'Average expenditure (Rs.) per student on school expenditure during the current academic year',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
        ],
        defaultValue: 'Rural',
      },
      {
        id: 'breakdown',
        label: 'Breakdown',
        options: [
          { value: 'Total', label: 'Total (All Items)' },
          { value: 'ExpItemCourseFee', label: 'Course Fee' },
          { value: 'ExpItemOthers', label: 'Others' },
          { value: 'ExpItemTextbookStationery', label: 'Textbook & Stationery' },
          { value: 'ExpItemTransportation', label: 'Transportation' },
          { value: 'ExpItemUniform', label: 'Uniform' },
          { value: 'SchoolTypeAllNonGovernment', label: 'All Non-Government Schools' },
          { value: 'SchoolTypeGovernment', label: 'Government Schools' },
          { value: 'SchoolTypeOthers', label: 'Other Schools' },
          { value: 'SchoolTypePrivateAided', label: 'Private Aided Schools' },
          { value: 'SchoolTypePrivateUnaided', label: 'Private Unaided Schools' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'NSS80_Expenditure_AveragePerStudent_Rural',
      'NSS80_Expenditure_AveragePerStudent_Rural_ExpItemCourseFee',
      'NSS80_Expenditure_AveragePerStudent_Rural_ExpItemOthers',
      'NSS80_Expenditure_AveragePerStudent_Rural_ExpItemTextbookStationery',
      'NSS80_Expenditure_AveragePerStudent_Rural_ExpItemTransportation',
      'NSS80_Expenditure_AveragePerStudent_Rural_ExpItemUniform',
      'NSS80_Expenditure_AveragePerStudent_Urban',
      'NSS80_Expenditure_AveragePerStudent_Urban_ExpItemCourseFee',
      'NSS80_Expenditure_AveragePerStudent_Urban_ExpItemOthers',
      'NSS80_Expenditure_AveragePerStudent_Urban_ExpItemTextbookStationery',
      'NSS80_Expenditure_AveragePerStudent_Urban_ExpItemTransportation',
      'NSS80_Expenditure_AveragePerStudent_Urban_ExpItemUniform',
      'NSS80_Expenditure_AveragePerStudent_Rural_SchoolTypeAllNonGovernment',
      'NSS80_Expenditure_AveragePerStudent_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerStudent_Urban_SchoolTypeAllNonGovernment',
      'NSS80_Expenditure_AveragePerStudent_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerStudent_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerStudent_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerStudent_Urban_SchoolTypePrivateUnaided',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const sector = filters.sector || 'Rural';
      const breakdown = filters.breakdown || 'Total';
      // "Total" means just the sector-level aggregate
      if (breakdown === 'Total') {
        return [`NSS80_Expenditure_AveragePerStudent_${sector}`];
      }
      return [`NSS80_Expenditure_AveragePerStudent_${sector}_${breakdown}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'breakdown', multiSelect: true }] },
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'breakdown', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'breakdown', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 20. NSS80 - Average expenditure per student by items of expenditure
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_avg_expenditure_by_item',
    name: 'Average expenditure (Rs.) per student on school education by items of expenditure',
    dataset: 'NSS80',
    chartType: 'bar',
    filters: [
      {
        id: 'expItem',
        label: 'Expenditure Item',
        options: [
          { value: 'ExpItemCourseFee', label: 'Course Fee' },
          { value: 'ExpItemOthers', label: 'Others' },
          { value: 'ExpItemTextbookStationery', label: 'Textbook & Stationery' },
          { value: 'ExpItemTransportation', label: 'Transportation' },
          { value: 'ExpItemUniform', label: 'Uniform' },
        ],
        defaultValue: 'ExpItemCourseFee',
      },
    ],
    statVars: [
      'NSS80_Expenditure_AveragePerStudent_ExpItemCourseFee',
      'NSS80_Expenditure_AveragePerStudent_ExpItemOthers',
      'NSS80_Expenditure_AveragePerStudent_ExpItemTextbookStationery',
      'NSS80_Expenditure_AveragePerStudent_ExpItemTransportation',
      'NSS80_Expenditure_AveragePerStudent_ExpItemUniform',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const expItem = filters.expItem || 'ExpItemCourseFee';
      return [`NSS80_Expenditure_AveragePerStudent_${expItem}`];
    },
    views: [
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'expItem', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'expItem', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'expItem', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 21. NSS80 - Average expenditure per reported student in school education
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_avg_expenditure_per_reported_student',
    name: 'Average expenditure (Rs.) per reported student in school education',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Middle', label: 'Middle' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'schoolType',
        label: 'School Type',
        options: [
          { value: 'SchoolTypeGovernment', label: 'Government' },
          { value: 'SchoolTypeOthers', label: 'Others' },
          { value: 'SchoolTypePrivateAided', label: 'Private Aided' },
          { value: 'SchoolTypePrivateUnaided', label: 'Private Unaided' },
        ],
        defaultValue: 'SchoolTypeGovernment',
      },
    ],
    statVars: [
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Middle_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_PrePrimary_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Primary_Urban_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Rural_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Rural_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Rural_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Rural_SchoolTypePrivateUnaided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Urban_SchoolTypeGovernment',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Urban_SchoolTypeOthers',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Urban_SchoolTypePrivateAided',
      'NSS80_Expenditure_AveragePerReportedStudent_Secondary_Urban_SchoolTypePrivateUnaided',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const sector = filters.sector || 'All';
      const schoolType = filters.schoolType || 'SchoolTypeGovernment';
      if (sector === 'All') {
        return [`NSS80_Expenditure_AveragePerReportedStudent_${level}_${schoolType}`];
      }
      return [`NSS80_Expenditure_AveragePerReportedStudent_${level}_${sector}_${schoolType}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'schoolType', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'sector', multiSelect: true }, { filterId: 'schoolType', multiSelect: false }] },
      { chartType: 'heatmap', label: 'Heatmap', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 22. NSS80 - Percentage of students taking private coaching
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_coaching_percentage',
    name: 'Percentage of students who were taking/had taken private coaching during the current academic year',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'All', label: 'All Levels' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Middle', label: 'Middle' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'All', label: 'All (Person)' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
    ],
    statVars: [
      'NSS80_Coaching_Percentage',
      'NSS80_Coaching_Percentage_Rural',
      'NSS80_Coaching_Percentage_Urban',
      'NSS80_Coaching_Percentage_HigherSecondary_Female',
      'NSS80_Coaching_Percentage_HigherSecondary_Female_Rural',
      'NSS80_Coaching_Percentage_HigherSecondary_Female_Urban',
      'NSS80_Coaching_Percentage_HigherSecondary_Male',
      'NSS80_Coaching_Percentage_HigherSecondary_Male_Rural',
      'NSS80_Coaching_Percentage_HigherSecondary_Male_Urban',
      'NSS80_Coaching_Percentage_HigherSecondary',
      'NSS80_Coaching_Percentage_HigherSecondary_Rural',
      'NSS80_Coaching_Percentage_HigherSecondary_Urban',
      'NSS80_Coaching_Percentage_Middle_Female',
      'NSS80_Coaching_Percentage_Middle_Female_Rural',
      'NSS80_Coaching_Percentage_Middle_Female_Urban',
      'NSS80_Coaching_Percentage_Middle_Male',
      'NSS80_Coaching_Percentage_Middle_Male_Rural',
      'NSS80_Coaching_Percentage_Middle_Male_Urban',
      'NSS80_Coaching_Percentage_Middle',
      'NSS80_Coaching_Percentage_Middle_Rural',
      'NSS80_Coaching_Percentage_Middle_Urban',
      'NSS80_Coaching_Percentage_PrePrimary_Female',
      'NSS80_Coaching_Percentage_PrePrimary_Female_Rural',
      'NSS80_Coaching_Percentage_PrePrimary_Female_Urban',
      'NSS80_Coaching_Percentage_PrePrimary_Male',
      'NSS80_Coaching_Percentage_PrePrimary_Male_Rural',
      'NSS80_Coaching_Percentage_PrePrimary_Male_Urban',
      'NSS80_Coaching_Percentage_PrePrimary',
      'NSS80_Coaching_Percentage_PrePrimary_Rural',
      'NSS80_Coaching_Percentage_PrePrimary_Urban',
      'NSS80_Coaching_Percentage_Primary_Female',
      'NSS80_Coaching_Percentage_Primary_Female_Rural',
      'NSS80_Coaching_Percentage_Primary_Female_Urban',
      'NSS80_Coaching_Percentage_Primary_Male',
      'NSS80_Coaching_Percentage_Primary_Male_Rural',
      'NSS80_Coaching_Percentage_Primary_Male_Urban',
      'NSS80_Coaching_Percentage_Primary',
      'NSS80_Coaching_Percentage_Primary_Rural',
      'NSS80_Coaching_Percentage_Primary_Urban',
      'NSS80_Coaching_Percentage_Secondary_Female',
      'NSS80_Coaching_Percentage_Secondary_Female_Rural',
      'NSS80_Coaching_Percentage_Secondary_Female_Urban',
      'NSS80_Coaching_Percentage_Secondary_Male',
      'NSS80_Coaching_Percentage_Secondary_Male_Rural',
      'NSS80_Coaching_Percentage_Secondary_Male_Urban',
      'NSS80_Coaching_Percentage_Secondary',
      'NSS80_Coaching_Percentage_Secondary_Rural',
      'NSS80_Coaching_Percentage_Secondary_Urban',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'All';
      const gender = filters.gender || 'All';
      const sector = filters.sector || 'All';
      // Build stat var: NSS80_Coaching_Percentage[_{Level}][_{Gender}][_{Sector}]
      let statVar = 'NSS80_Coaching_Percentage';
      if (level !== 'All') {
        statVar += `_${level}`;
      }
      if (gender !== 'All') {
        statVar += `_${gender}`;
      }
      if (sector !== 'All') {
        statVar += `_${sector}`;
      }
      return [statVar];
    },
    views: [
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 23. NSS80 - Average expenditure on private coaching per student by level
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_coaching_avg_expenditure',
    name: 'Average expenditure (Rs.) on private coaching per student during the current academic year by level of current enrolment',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'All', label: 'All Levels' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Middle', label: 'Middle' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'All', label: 'All (Person)' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
    ],
    statVars: [
      'NSS80_Coaching_AverageExpenditurePerStudent',
      'NSS80_Coaching_AverageExpenditurePerStudent_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Female',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Female_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Female_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Male',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Male_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Male_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_HigherSecondary_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Female',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Female_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Female_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Male',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Male_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Male_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Middle_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Female',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Female_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Female_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Male',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Male_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Male_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_PrePrimary_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Female',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Female_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Female_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Male',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Male_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Male_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Primary_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Female',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Female_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Female_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Male',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Male_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Male_Urban',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Rural',
      'NSS80_Coaching_AverageExpenditurePerStudent_Secondary_Urban',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'All';
      const gender = filters.gender || 'All';
      const sector = filters.sector || 'All';
      let statVar = 'NSS80_Coaching_AverageExpenditurePerStudent';
      if (level !== 'All') {
        statVar += `_${level}`;
      }
      if (gender !== 'All') {
        statVar += `_${gender}`;
      }
      if (sector !== 'All') {
        statVar += `_${sector}`;
      }
      return [statVar];
    },
    views: [
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: 'INR',
  },

  // ---------------------------------------------------------------------------
  // 24. NSS80 - Funding source distribution
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_funding_source_distribution',
    name: 'Percentage of students reported a single source of funding for their educational expenses and distribution of the first major source of funding for education expenditure',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female' },
          { value: 'Male', label: 'Male' },
          { value: 'All', label: 'All (Person)' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'metric',
        label: 'Metric',
        options: [
          { value: 'SourceDistribution', label: 'Source Distribution (Total)' },
          { value: 'SourceDistribution_SOF_ErstwhileMember', label: 'Source: Erstwhile Member' },
          { value: 'SourceDistribution_SOF_HouseholdMember', label: 'Source: Household Member' },
          { value: 'SourceDistribution_SOF_Other', label: 'Source: Other' },
          { value: 'SourceDistribution_SOF_GovernmentScholarship', label: 'Source: Government Scholarship' },
          { value: 'SingleSourcePercentage', label: 'Single Source Percentage' },
        ],
        defaultValue: 'SourceDistribution',
      },
    ],
    statVars: [
      'NSS80_Funding_SourceDistribution_Female_Rural',
      'NSS80_Funding_SourceDistribution_Female_Rural_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Female_Rural_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Female_Rural_SOF_Other',
      'NSS80_Funding_SourceDistribution_Female_Rural_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Female_Rural',
      'NSS80_Funding_SourceDistribution_Female_Urban',
      'NSS80_Funding_SourceDistribution_Female_Urban_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Female_Urban_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Female_Urban_SOF_Other',
      'NSS80_Funding_SourceDistribution_Female_Urban_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Female_Urban',
      'NSS80_Funding_SourceDistribution_Male',
      'NSS80_Funding_SourceDistribution_Male_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Male_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Male_SOF_Other',
      'NSS80_Funding_SourceDistribution_Male_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Male',
      'NSS80_Funding_SourceDistribution_Male_Rural',
      'NSS80_Funding_SourceDistribution_Male_Rural_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Male_Rural_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Male_Rural_SOF_Other',
      'NSS80_Funding_SourceDistribution_Male_Rural_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Male_Rural',
      'NSS80_Funding_SourceDistribution_Male_Urban',
      'NSS80_Funding_SourceDistribution_Male_Urban_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Male_Urban_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Male_Urban_SOF_Other',
      'NSS80_Funding_SourceDistribution_Male_Urban_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Male_Urban',
      'NSS80_Funding_SourceDistribution',
      'NSS80_Funding_SourceDistribution_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_SOF_Other',
      'NSS80_Funding_SourceDistribution_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage',
      'NSS80_Funding_SourceDistribution_Rural',
      'NSS80_Funding_SourceDistribution_Rural_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Rural_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Rural_SOF_Other',
      'NSS80_Funding_SourceDistribution_Rural_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Rural',
      'NSS80_Funding_SourceDistribution_Urban',
      'NSS80_Funding_SourceDistribution_Urban_SOF_ErstwhileMember',
      'NSS80_Funding_SourceDistribution_Urban_SOF_HouseholdMember',
      'NSS80_Funding_SourceDistribution_Urban_SOF_Other',
      'NSS80_Funding_SourceDistribution_Urban_SOF_GovernmentScholarship',
      'NSS80_Funding_SingleSourcePercentage_Urban',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const gender = filters.gender || 'All';
      const sector = filters.sector || 'All';
      const metric = filters.metric || 'SourceDistribution';

      // The stat var naming pattern is complex. The metric can be either
      // "SingleSourcePercentage" or "SourceDistribution[_SOF_*]".
      // Gender and sector are placed BETWEEN the prefix and the SOF suffix.

      if (metric === 'SingleSourcePercentage') {
        // NSS80_Funding_SingleSourcePercentage[_{Gender}][_{Sector}]
        let statVar = 'NSS80_Funding_SingleSourcePercentage';
        if (gender !== 'All') {
          statVar += `_${gender}`;
        }
        if (sector !== 'All') {
          statVar += `_${sector}`;
        }
        return [statVar];
      }

      // For SourceDistribution metrics
      if (metric === 'SourceDistribution') {
        // NSS80_Funding_SourceDistribution[_{Gender}][_{Sector}]
        let statVar = 'NSS80_Funding_SourceDistribution';
        if (gender !== 'All') {
          statVar += `_${gender}`;
        }
        if (sector !== 'All') {
          statVar += `_${sector}`;
        }
        return [statVar];
      }

      // For SourceDistribution_SOF_* metrics
      // NSS80_Funding_SourceDistribution[_{Gender}][_{Sector}]_SOF_*
      const sofSuffix = (metric as string).replace('SourceDistribution_', '');
      let statVar = 'NSS80_Funding_SourceDistribution';
      if (gender !== 'All') {
        statVar += `_${gender}`;
      }
      if (sector !== 'All') {
        statVar += `_${sector}`;
      }
      statVar += `_${sofSuffix}`;
      return [statVar];
    },
    views: [
      { chartType: 'stackedBar', label: 'Stacked Bar', colorByLabel: 'Source of Funding', filters: [{ filterId: 'sector', multiSelect: true }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 25. NSS80 - Households reporting erstwhile members
  // ---------------------------------------------------------------------------
  {
    id: 'nss80_households_erstwhile_members',
    name: 'Percentage of households reporting erstwhile members currently attending school education along with average expenditure (Rs.) incurred per household and their distribution by number of such erstwhile members',
    dataset: 'NSS80',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'sector',
        label: 'Sector',
        options: [
          { value: 'Rural', label: 'Rural' },
          { value: 'Urban', label: 'Urban' },
          { value: 'All', label: 'All' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'metric',
        label: 'Metric',
        options: [
          { value: 'ErstwhileMembersCountDistribution', label: 'Distribution (Total)' },
          { value: 'ErstwhileMembersCountDistribution_Members1', label: 'Distribution: 1 Member' },
          { value: 'ErstwhileMembersCountDistribution_Members2', label: 'Distribution: 2 Members' },
          { value: 'ErstwhileMembersCountDistribution_Members3OrMore', label: 'Distribution: 3+ Members' },
          { value: 'ReportingErstwhileMembers', label: 'Reporting Erstwhile Members (%)' },
        ],
        defaultValue: 'ReportingErstwhileMembers',
      },
    ],
    statVars: [
      'NSS80_Households_ErstwhileMembersCountDistribution_Members1',
      'NSS80_Households_ErstwhileMembersCountDistribution_Members2',
      'NSS80_Households_ErstwhileMembersCountDistribution_Members3OrMore',
      'NSS80_Households_ErstwhileMembersCountDistribution',
      'NSS80_Households_ReportingErstwhileMembers',
      'NSS80_Households_ErstwhileMembersCountDistribution_Rural_Members1',
      'NSS80_Households_ErstwhileMembersCountDistribution_Rural_Members2',
      'NSS80_Households_ErstwhileMembersCountDistribution_Rural_Members3OrMore',
      'NSS80_Households_ErstwhileMembersCountDistribution_Rural',
      'NSS80_Households_ReportingErstwhileMembers_Rural',
      'NSS80_Households_ErstwhileMembersCountDistribution_Urban_Members1',
      'NSS80_Households_ErstwhileMembersCountDistribution_Urban_Members2',
      'NSS80_Households_ErstwhileMembersCountDistribution_Urban_Members3OrMore',
      'NSS80_Households_ErstwhileMembersCountDistribution_Urban',
      'NSS80_Households_ReportingErstwhileMembers_Urban',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const sector = filters.sector || 'All';
      const metric = filters.metric || 'ReportingErstwhileMembers';

      if (metric === 'ReportingErstwhileMembers') {
        if (sector === 'All') {
          return ['NSS80_Households_ReportingErstwhileMembers'];
        }
        return [`NSS80_Households_ReportingErstwhileMembers_${sector}`];
      }

      // For ErstwhileMembersCountDistribution and its sub-metrics
      if (metric === 'ErstwhileMembersCountDistribution') {
        if (sector === 'All') {
          return ['NSS80_Households_ErstwhileMembersCountDistribution'];
        }
        return [`NSS80_Households_ErstwhileMembersCountDistribution_${sector}`];
      }

      // Sub-metrics like ErstwhileMembersCountDistribution_Members1
      const membersSuffix = (metric as string).replace('ErstwhileMembersCountDistribution_', '');
      if (sector === 'All') {
        return [`NSS80_Households_ErstwhileMembersCountDistribution_${membersSuffix}`];
      }
      return [`NSS80_Households_ErstwhileMembersCountDistribution_${sector}_${membersSuffix}`];
    },
    views: [
      { chartType: 'stackedBar', label: 'Stacked Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'metric', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'sector', multiSelect: false }, { filterId: 'metric', multiSelect: false }] },
      { chartType: 'dumbbell', label: 'Dumbbell', filters: [{ filterId: 'sector', multiSelect: true }] },
    ],
    source: NSS80_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 26. UDISE - Details on Computers & Digital Initiatives
  // ---------------------------------------------------------------------------
  {
    id: 'udise_digital_initiatives',
    name: 'Details on Computers & Digital Initiatives',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'deviceType',
        label: 'Device / Facility Type',
        options: [
          { value: 'Desktoppcs', label: 'Desktop PCs' },
          { value: 'Laptopnotebook', label: 'Laptop/Notebook' },
          { value: 'Tablets', label: 'Tablets' },
        ],
        defaultValue: 'Desktoppcs',
      },
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Schools_DigitalInit_Desktoppcs_Government',
      'UDISE_Schools_DigitalInit_Desktoppcs_GovernmentAided',
      'UDISE_Schools_DigitalInit_Desktoppcs_Others',
      'UDISE_Schools_DigitalInit_Desktoppcs_PrivateUnaidedRecognized',
      'UDISE_Schools_DigitalInit_Desktoppcs_Total',
      'UDISE_Schools_DigitalInit_Laptopnotebook_Government',
      'UDISE_Schools_DigitalInit_Laptopnotebook_GovernmentAided',
      'UDISE_Schools_DigitalInit_Laptopnotebook_Others',
      'UDISE_Schools_DigitalInit_Laptopnotebook_PrivateUnaidedRecognized',
      'UDISE_Schools_DigitalInit_Laptopnotebook_Total',
      'UDISE_Schools_DigitalInit_Tablets_Government',
      'UDISE_Schools_DigitalInit_Tablets_GovernmentAided',
      'UDISE_Schools_DigitalInit_Tablets_Others',
      'UDISE_Schools_DigitalInit_Tablets_PrivateUnaidedRecognized',
      'UDISE_Schools_DigitalInit_Tablets_Total',
      'UDISE_Schools_WithComputerFacility',
      'UDISE_Schools_WithDigitalLibrary',
      'UDISE_Schools_WithFunctionalComputerFacilityForPedagogicalPurposes',
      'UDISE_Schools_WithInternetFacility',
      'UDISE_Schools_WithSolarPanel',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const deviceType = filters.deviceType || 'Desktoppcs';
      const management = filters.management || 'Total';
      return [`UDISE_Schools_DigitalInit_${deviceType}_${management}`];
    },
    views: [
      { chartType: 'bar', label: 'Bar', colorByLabel: 'Management', filters: [{ filterId: 'management', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'deviceType', multiSelect: true }, { filterId: 'management', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'deviceType', multiSelect: false }, { filterId: 'management', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 27. UDISE - School having ICT Labs
  // ---------------------------------------------------------------------------
  {
    id: 'udise_ict_labs',
    name: 'School having ICT Labs',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
        ],
        defaultValue: 'Government',
      },
      {
        id: 'functional',
        label: 'Status',
        options: [
          { value: 'All', label: 'All ICT Labs' },
          { value: 'Functional', label: 'Functional Only' },
        ],
        defaultValue: 'All',
      },
    ],
    statVars: [
      'UDISE_Schools_ICTLabs_Government',
      'UDISE_Schools_ICTLabs_Government_Functional',
      'UDISE_Schools_ICTLabs_GovernmentAided',
      'UDISE_Schools_ICTLabs_GovernmentAided_Functional',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const management = filters.management || 'Government';
      const functional = filters.functional || 'All';
      let statVar = `UDISE_Schools_ICTLabs_${management}`;
      if (functional === 'Functional') {
        statVar += '_Functional';
      }
      return [statVar];
    },
    views: [
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'management', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'functional', multiSelect: false }, { filterId: 'management', multiSelect: true }] },
      { chartType: 'treemap', label: 'Treemap', filters: [{ filterId: 'management', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 28. UDISE - Promotion Rate
  // ---------------------------------------------------------------------------
  {
    id: 'udise_promotion_rate',
    name: 'Promotion Rate',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_PromotionRate_Primary_Boys',
      'UDISE_PromotionRate_Primary_Girls',
      'UDISE_PromotionRate_Primary_Total',
      'UDISE_PromotionRate_Secondary_Boys',
      'UDISE_PromotionRate_Secondary_Girls',
      'UDISE_PromotionRate_Secondary_Total',
      'UDISE_PromotionRate_UpperPrimary_Boys',
      'UDISE_PromotionRate_UpperPrimary_Girls',
      'UDISE_PromotionRate_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_PromotionRate_${level}_${gender}`];
    },
    views: [
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Gender', filters: [{ filterId: 'level', multiSelect: false }, { filterId: 'gender', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 29. UDISE - Pupil Teacher Ratio by level of education
  // ---------------------------------------------------------------------------
  {
    id: 'udise_ptr_by_level',
    name: 'Pupil Teacher Ratio by level of education',
    dataset: 'UDISE',
    chartType: 'bar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_PupilTeacherRatio_HigherSecondary',
      'UDISE_PupilTeacherRatio_Primary',
      'UDISE_PupilTeacherRatio_Secondary',
      'UDISE_PupilTeacherRatio_UpperPrimary',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      return [`UDISE_PupilTeacherRatio_${level}`];
    },
    views: [
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: true }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 30. UDISE - Retention Rate
  // ---------------------------------------------------------------------------
  {
    id: 'udise_retention_rate',
    name: 'Retention Rate',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_RetentionRate_Elementary_Boys',
      'UDISE_RetentionRate_Elementary_Girls',
      'UDISE_RetentionRate_Elementary_Total',
      'UDISE_RetentionRate_HigherSecondary_Boys',
      'UDISE_RetentionRate_HigherSecondary_Girls',
      'UDISE_RetentionRate_HigherSecondary_Total',
      'UDISE_RetentionRate_Primary_Boys',
      'UDISE_RetentionRate_Primary_Girls',
      'UDISE_RetentionRate_Primary_Total',
      'UDISE_RetentionRate_Secondary_Boys',
      'UDISE_RetentionRate_Secondary_Girls',
      'UDISE_RetentionRate_Secondary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_RetentionRate_${level}_${gender}`];
    },
    views: [
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 31. UDISE - Transition Rate
  // ---------------------------------------------------------------------------
  {
    id: 'udise_transition_rate',
    name: 'Transition Rate',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'transition',
        label: 'Transition',
        options: [
          { value: 'PrimaryToUpperPrimary', label: 'Primary to Upper Primary' },
          { value: 'UpperPrimaryToSecondary', label: 'Upper Primary to Secondary' },
          { value: 'SecondaryToHigherSecondary', label: 'Secondary to Higher Secondary' },
        ],
        defaultValue: 'PrimaryToUpperPrimary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_TransitionRate_PrimaryToUpperPrimary_Boys',
      'UDISE_TransitionRate_PrimaryToUpperPrimary_Girls',
      'UDISE_TransitionRate_PrimaryToUpperPrimary_Total',
      'UDISE_TransitionRate_SecondaryToHigherSecondary_Boys',
      'UDISE_TransitionRate_SecondaryToHigherSecondary_Girls',
      'UDISE_TransitionRate_SecondaryToHigherSecondary_Total',
      'UDISE_TransitionRate_UpperPrimaryToSecondary_Boys',
      'UDISE_TransitionRate_UpperPrimaryToSecondary_Girls',
      'UDISE_TransitionRate_UpperPrimaryToSecondary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const transition = filters.transition || 'PrimaryToUpperPrimary';
      const gender = filters.gender || 'Total';
      return [`UDISE_TransitionRate_${transition}_${gender}`];
    },
    views: [
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'transition', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'transition', multiSelect: false }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'transition', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 32. UDISE - Drinking water facility
  // ---------------------------------------------------------------------------
  {
    id: 'udise_drinking_water',
    name: 'Number of schools having drinking water facility within school premises by all types of management',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'waterSource',
        label: 'Water Source',
        options: [
          { value: 'AnySource', label: 'Any Source' },
          { value: 'HandPumps', label: 'Hand Pumps' },
          { value: 'Others', label: 'Others' },
          { value: 'ProtectedWell', label: 'Protected Well' },
          { value: 'TapWater', label: 'Tap Water' },
          { value: 'UnprotectedWell', label: 'Unprotected Well' },
        ],
        defaultValue: 'AnySource',
      },
      {
        id: 'valueType',
        label: 'Value Type',
        options: [
          { value: 'Count', label: 'Count' },
          { value: 'Percentage', label: 'Percentage' },
        ],
        defaultValue: 'Count',
      },
    ],
    statVars: [
      'UDISE_Schools_DrinkingWater_Government_AnySource',
      'UDISE_Schools_DrinkingWater_Government_AnySource_Percentage',
      'UDISE_Schools_DrinkingWater_Government_HandPumps',
      'UDISE_Schools_DrinkingWater_Government_HandPumps_Percentage',
      'UDISE_Schools_DrinkingWater_Government_Others',
      'UDISE_Schools_DrinkingWater_Government_Others_Percentage',
      'UDISE_Schools_DrinkingWater_Government_ProtectedWell',
      'UDISE_Schools_DrinkingWater_Government_ProtectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_Government_TapWater',
      'UDISE_Schools_DrinkingWater_Government_TapWater_Percentage',
      'UDISE_Schools_DrinkingWater_Government_UnprotectedWell',
      'UDISE_Schools_DrinkingWater_Government_UnprotectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_AnySource',
      'UDISE_Schools_DrinkingWater_GovernmentAided_AnySource_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_HandPumps',
      'UDISE_Schools_DrinkingWater_GovernmentAided_HandPumps_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_Others',
      'UDISE_Schools_DrinkingWater_GovernmentAided_Others_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_ProtectedWell',
      'UDISE_Schools_DrinkingWater_GovernmentAided_ProtectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_TapWater',
      'UDISE_Schools_DrinkingWater_GovernmentAided_TapWater_Percentage',
      'UDISE_Schools_DrinkingWater_GovernmentAided_UnprotectedWell',
      'UDISE_Schools_DrinkingWater_GovernmentAided_UnprotectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_Others_AnySource',
      'UDISE_Schools_DrinkingWater_Others_AnySource_Percentage',
      'UDISE_Schools_DrinkingWater_Others_HandPumps',
      'UDISE_Schools_DrinkingWater_Others_HandPumps_Percentage',
      'UDISE_Schools_DrinkingWater_Others_Others',
      'UDISE_Schools_DrinkingWater_Others_Others_Percentage',
      'UDISE_Schools_DrinkingWater_Others_ProtectedWell',
      'UDISE_Schools_DrinkingWater_Others_ProtectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_Others_TapWater',
      'UDISE_Schools_DrinkingWater_Others_TapWater_Percentage',
      'UDISE_Schools_DrinkingWater_Others_UnprotectedWell',
      'UDISE_Schools_DrinkingWater_Others_UnprotectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_AnySource',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_AnySource_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_HandPumps',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_HandPumps_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_Others',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_Others_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_ProtectedWell',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_ProtectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_TapWater',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_TapWater_Percentage',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_UnprotectedWell',
      'UDISE_Schools_DrinkingWater_PrivateUnaidedRecognized_UnprotectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_Total_AnySource',
      'UDISE_Schools_DrinkingWater_Total_AnySource_Percentage',
      'UDISE_Schools_DrinkingWater_Total_HandPumps',
      'UDISE_Schools_DrinkingWater_Total_HandPumps_Percentage',
      'UDISE_Schools_DrinkingWater_Total_Others',
      'UDISE_Schools_DrinkingWater_Total_Others_Percentage',
      'UDISE_Schools_DrinkingWater_Total_ProtectedWell',
      'UDISE_Schools_DrinkingWater_Total_ProtectedWell_Percentage',
      'UDISE_Schools_DrinkingWater_Total_TapWater',
      'UDISE_Schools_DrinkingWater_Total_TapWater_Percentage',
      'UDISE_Schools_DrinkingWater_Total_UnprotectedWell',
      'UDISE_Schools_DrinkingWater_Total_UnprotectedWell_Percentage',
      'UDISE_Schools_WithDrinkingWater',
      'UDISE_Schools_WithFunctionalDrinkingWater',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const management = filters.management || 'Total';
      const waterSource = filters.waterSource || 'AnySource';
      const valueType = filters.valueType || 'Count';
      let statVar = `UDISE_Schools_DrinkingWater_${management}_${waterSource}`;
      if (valueType === 'Percentage') {
        statVar += '_Percentage';
      }
      return [statVar];
    },
    views: [
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'management', multiSelect: true }, { filterId: 'waterSource', multiSelect: false }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', filters: [{ filterId: 'management', multiSelect: false }, { filterId: 'waterSource', multiSelect: true }] },
      { chartType: 'treemap', label: 'Treemap', filters: [{ filterId: 'management', multiSelect: false }, { filterId: 'waterSource', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 33. UDISE - Enrolment of Students (by level, up to higher secondary)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_enrolment_by_level',
    name: 'Enrolment of Students (According to level of education, upto higher secondary)',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'PrimaryToHigherSecondary', label: 'Primary to Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Total', label: 'Total' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Enrolment_Elementary_GovernmentAided_Boys',
      'UDISE_Enrolment_Elementary_GovernmentAided_Girls',
      'UDISE_Enrolment_Elementary_GovernmentAided_Total',
      'UDISE_Enrolment_Elementary_Government_Boys',
      'UDISE_Enrolment_Elementary_Government_Girls',
      'UDISE_Enrolment_Elementary_Government_Total',
      'UDISE_Enrolment_Elementary_Others_Boys',
      'UDISE_Enrolment_Elementary_Others_Girls',
      'UDISE_Enrolment_Elementary_Others_Total',
      'UDISE_Enrolment_Elementary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_Elementary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_Elementary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_Elementary_Total_Boys',
      'UDISE_Enrolment_Elementary_Total_Girls',
      'UDISE_Enrolment_Elementary_Total_Total',
      'UDISE_Enrolment_HigherSecondary_GovernmentAided_Boys',
      'UDISE_Enrolment_HigherSecondary_GovernmentAided_Girls',
      'UDISE_Enrolment_HigherSecondary_GovernmentAided_Total',
      'UDISE_Enrolment_HigherSecondary_Government_Boys',
      'UDISE_Enrolment_HigherSecondary_Government_Girls',
      'UDISE_Enrolment_HigherSecondary_Government_Total',
      'UDISE_Enrolment_HigherSecondary_Others_Boys',
      'UDISE_Enrolment_HigherSecondary_Others_Girls',
      'UDISE_Enrolment_HigherSecondary_Others_Total',
      'UDISE_Enrolment_HigherSecondary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_HigherSecondary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_HigherSecondary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_HigherSecondary_Total_Boys',
      'UDISE_Enrolment_HigherSecondary_Total_Girls',
      'UDISE_Enrolment_HigherSecondary_Total_Total',
      'UDISE_Enrolment_PrePrimary_GovernmentAided_Boys',
      'UDISE_Enrolment_PrePrimary_GovernmentAided_Girls',
      'UDISE_Enrolment_PrePrimary_GovernmentAided_Total',
      'UDISE_Enrolment_PrePrimary_Government_Boys',
      'UDISE_Enrolment_PrePrimary_Government_Girls',
      'UDISE_Enrolment_PrePrimary_Government_Total',
      'UDISE_Enrolment_PrePrimary_Others_Boys',
      'UDISE_Enrolment_PrePrimary_Others_Girls',
      'UDISE_Enrolment_PrePrimary_Others_Total',
      'UDISE_Enrolment_PrePrimary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_PrePrimary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_PrePrimary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_PrePrimary_Total_Boys',
      'UDISE_Enrolment_PrePrimary_Total_Girls',
      'UDISE_Enrolment_PrePrimary_Total_Total',
      'UDISE_Enrolment_PrimaryToHigherSecondary_GovernmentAided_Boys',
      'UDISE_Enrolment_PrimaryToHigherSecondary_GovernmentAided_Girls',
      'UDISE_Enrolment_PrimaryToHigherSecondary_GovernmentAided_Total',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Government_Boys',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Government_Girls',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Government_Total',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Others_Boys',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Others_Girls',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Others_Total',
      'UDISE_Enrolment_PrimaryToHigherSecondary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_PrimaryToHigherSecondary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_PrimaryToHigherSecondary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Total_Boys',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Total_Girls',
      'UDISE_Enrolment_PrimaryToHigherSecondary_Total_Total',
      'UDISE_Enrolment_Primary_GovernmentAided_Boys',
      'UDISE_Enrolment_Primary_GovernmentAided_Girls',
      'UDISE_Enrolment_Primary_GovernmentAided_Total',
      'UDISE_Enrolment_Primary_Government_Boys',
      'UDISE_Enrolment_Primary_Government_Girls',
      'UDISE_Enrolment_Primary_Government_Total',
      'UDISE_Enrolment_Primary_Others_Boys',
      'UDISE_Enrolment_Primary_Others_Girls',
      'UDISE_Enrolment_Primary_Others_Total',
      'UDISE_Enrolment_Primary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_Primary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_Primary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_Primary_Total_Boys',
      'UDISE_Enrolment_Primary_Total_Girls',
      'UDISE_Enrolment_Primary_Total_Total',
      'UDISE_Enrolment_Secondary_GovernmentAided_Boys',
      'UDISE_Enrolment_Secondary_GovernmentAided_Girls',
      'UDISE_Enrolment_Secondary_GovernmentAided_Total',
      'UDISE_Enrolment_Secondary_Government_Boys',
      'UDISE_Enrolment_Secondary_Government_Girls',
      'UDISE_Enrolment_Secondary_Government_Total',
      'UDISE_Enrolment_Secondary_Others_Boys',
      'UDISE_Enrolment_Secondary_Others_Girls',
      'UDISE_Enrolment_Secondary_Others_Total',
      'UDISE_Enrolment_Secondary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_Secondary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_Secondary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_Secondary_Total_Boys',
      'UDISE_Enrolment_Secondary_Total_Girls',
      'UDISE_Enrolment_Secondary_Total_Total',
      'UDISE_Enrolment_Total_GovernmentAided_Boys',
      'UDISE_Enrolment_Total_GovernmentAided_Girls',
      'UDISE_Enrolment_Total_GovernmentAided_Total',
      'UDISE_Enrolment_Total_Government_Boys',
      'UDISE_Enrolment_Total_Government_Girls',
      'UDISE_Enrolment_Total_Government_Total',
      'UDISE_Enrolment_Total_Others_Boys',
      'UDISE_Enrolment_Total_Others_Girls',
      'UDISE_Enrolment_Total_Others_Total',
      'UDISE_Enrolment_Total_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_Total_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_Total_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_Total_Total_Boys',
      'UDISE_Enrolment_Total_Total_Girls',
      'UDISE_Enrolment_Total_Total_Total',
      'UDISE_Enrolment_UpperPrimary_GovernmentAided_Boys',
      'UDISE_Enrolment_UpperPrimary_GovernmentAided_Girls',
      'UDISE_Enrolment_UpperPrimary_GovernmentAided_Total',
      'UDISE_Enrolment_UpperPrimary_Government_Boys',
      'UDISE_Enrolment_UpperPrimary_Government_Girls',
      'UDISE_Enrolment_UpperPrimary_Government_Total',
      'UDISE_Enrolment_UpperPrimary_Others_Boys',
      'UDISE_Enrolment_UpperPrimary_Others_Girls',
      'UDISE_Enrolment_UpperPrimary_Others_Total',
      'UDISE_Enrolment_UpperPrimary_PrivateUnaidedRecognized_Boys',
      'UDISE_Enrolment_UpperPrimary_PrivateUnaidedRecognized_Girls',
      'UDISE_Enrolment_UpperPrimary_PrivateUnaidedRecognized_Total',
      'UDISE_Enrolment_UpperPrimary_Total_Boys',
      'UDISE_Enrolment_UpperPrimary_Total_Girls',
      'UDISE_Enrolment_UpperPrimary_Total_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Total';
      const management = filters.management || 'Total';
      const gender = filters.gender || 'Total';
      // Pattern: UDISE_Enrolment_{Level}_{Management}_{Gender}
      return [`UDISE_Enrolment_${level}_${management}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Gender', filters: [{ filterId: 'management', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'horizontalBar', label: 'Horizontal Bar', colorByLabel: 'Gender', filters: [{ filterId: 'management', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Management', filters: [{ filterId: 'management', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 34. UDISE - Minority enrolment percentage
  // ---------------------------------------------------------------------------
  {
    id: 'udise_minority_enrolment_percentage',
    name: 'Percentage of all minority groups enrolment to total enrolment',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'PrimaryToHigherSecondary', label: 'Primary to Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Enrolment_Minority_Percentage_Elementary_Boys',
      'UDISE_Enrolment_Minority_Percentage_Elementary_Girls',
      'UDISE_Enrolment_Minority_Percentage_Elementary_Total',
      'UDISE_Enrolment_Minority_Percentage_HigherSecondary_Boys',
      'UDISE_Enrolment_Minority_Percentage_HigherSecondary_Girls',
      'UDISE_Enrolment_Minority_Percentage_HigherSecondary_Total',
      'UDISE_Enrolment_Minority_Percentage_PrimaryToHigherSecondary_Boys',
      'UDISE_Enrolment_Minority_Percentage_PrimaryToHigherSecondary_Girls',
      'UDISE_Enrolment_Minority_Percentage_PrimaryToHigherSecondary_Total',
      'UDISE_Enrolment_Minority_Percentage_Primary_Boys',
      'UDISE_Enrolment_Minority_Percentage_Primary_Girls',
      'UDISE_Enrolment_Minority_Percentage_Primary_Total',
      'UDISE_Enrolment_Minority_Percentage_Secondary_Boys',
      'UDISE_Enrolment_Minority_Percentage_Secondary_Girls',
      'UDISE_Enrolment_Minority_Percentage_Secondary_Total',
      'UDISE_Enrolment_Minority_Percentage_UpperPrimary_Boys',
      'UDISE_Enrolment_Minority_Percentage_UpperPrimary_Girls',
      'UDISE_Enrolment_Minority_Percentage_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_Enrolment_Minority_Percentage_${level}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', colorByLabel: 'Year', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'bar', label: 'Bar', colorByLabel: 'Level of Education', filters: [{ filterId: 'gender', multiSelect: false }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 35. UDISE - Number of schools by management and facilities
  // ---------------------------------------------------------------------------
  {
    id: 'udise_schools_by_management_facilities',
    name: 'Number of schools by management and Facilities',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'All', label: 'All (Total)' },
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
        ],
        defaultValue: 'All',
      },
      {
        id: 'level',
        label: 'School Category',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'HigherSecondaryOnly', label: 'Higher Secondary Only' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'PrePrimaryOnly', label: 'Pre-Primary Only' },
          { value: 'Primary', label: 'Primary' },
          { value: 'PrimaryOnly', label: 'Primary Only' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'SecondaryOnly', label: 'Secondary Only' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
          { value: 'UpperPrimaryOnly', label: 'Upper Primary Only' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_Schools_Count_Elementary',
      'UDISE_Schools_Count_GovernmentAided_Elementary',
      'UDISE_Schools_Count_GovernmentAided_HigherSecondary',
      'UDISE_Schools_Count_GovernmentAided_HigherSecondaryOnly',
      'UDISE_Schools_Count_GovernmentAided_PrePrimary',
      'UDISE_Schools_Count_GovernmentAided_PrePrimaryOnly',
      'UDISE_Schools_Count_GovernmentAided_Primary',
      'UDISE_Schools_Count_GovernmentAided_PrimaryOnly',
      'UDISE_Schools_Count_GovernmentAided_Secondary',
      'UDISE_Schools_Count_GovernmentAided_SecondaryOnly',
      'UDISE_Schools_Count_GovernmentAided_UpperPrimary',
      'UDISE_Schools_Count_GovernmentAided_UpperPrimaryOnly',
      'UDISE_Schools_Count_Government_Elementary',
      'UDISE_Schools_Count_Government_HigherSecondary',
      'UDISE_Schools_Count_Government_HigherSecondaryOnly',
      'UDISE_Schools_Count_Government_PrePrimary',
      'UDISE_Schools_Count_Government_PrePrimaryOnly',
      'UDISE_Schools_Count_Government_Primary',
      'UDISE_Schools_Count_Government_PrimaryOnly',
      'UDISE_Schools_Count_Government_Secondary',
      'UDISE_Schools_Count_Government_SecondaryOnly',
      'UDISE_Schools_Count_Government_UpperPrimary',
      'UDISE_Schools_Count_Government_UpperPrimaryOnly',
      'UDISE_Schools_Count_HigherSecondary',
      'UDISE_Schools_Count_HigherSecondaryOnly',
      'UDISE_Schools_Count_Others_Elementary',
      'UDISE_Schools_Count_Others_HigherSecondary',
      'UDISE_Schools_Count_Others_HigherSecondaryOnly',
      'UDISE_Schools_Count_Others_PrePrimary',
      'UDISE_Schools_Count_Others_PrePrimaryOnly',
      'UDISE_Schools_Count_Others_Primary',
      'UDISE_Schools_Count_Others_PrimaryOnly',
      'UDISE_Schools_Count_Others_Secondary',
      'UDISE_Schools_Count_Others_SecondaryOnly',
      'UDISE_Schools_Count_Others_UpperPrimary',
      'UDISE_Schools_Count_Others_UpperPrimaryOnly',
      'UDISE_Schools_Count_PrePrimary',
      'UDISE_Schools_Count_PrePrimaryOnly',
      'UDISE_Schools_Count_Primary',
      'UDISE_Schools_Count_PrimaryOnly',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_Elementary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_HigherSecondary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_HigherSecondaryOnly',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_PrePrimary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_PrePrimaryOnly',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_Primary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_PrimaryOnly',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_Secondary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_SecondaryOnly',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_UpperPrimary',
      'UDISE_Schools_Count_PrivateUnaidedRecognized_UpperPrimaryOnly',
      'UDISE_Schools_Count_Secondary',
      'UDISE_Schools_Count_SecondaryOnly',
      'UDISE_Schools_Count_UpperPrimary',
      'UDISE_Schools_Count_UpperPrimaryOnly',
      'UDISE_Schools_Facilities_Total_GovernmentAided',
      'UDISE_Schools_Facilities_Total_Others',
      'UDISE_Schools_Facilities_Total_PrivateUnaidedRecognized',
      'UDISE_Schools_Facilities_Total_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const management = filters.management || 'All';
      const level = filters.level || 'Primary';
      // When management is "All", the stat var has no management prefix
      if (management === 'All') {
        return [`UDISE_Schools_Count_${level}`];
      }
      return [`UDISE_Schools_Count_${management}_${level}`];
    },
    views: [
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'management', multiSelect: true }] },
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'management', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'management', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 36. UDISE - Number of teachers by management, gender and classes taught
  // ---------------------------------------------------------------------------
  {
    id: 'udise_teachers_by_management_classes',
    name: 'Number of teachers by management, gender and classes taught',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'Government', label: 'Government' },
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'classesTaught',
        label: 'Classes Taught',
        options: [
          { value: 'HigherSecondaryOnly', label: 'Higher Secondary Only' },
          { value: 'PrePrimaryAndPrimary', label: 'Pre-Primary & Primary' },
          { value: 'PrePrimaryOnly', label: 'Pre-Primary Only' },
          { value: 'PrimaryAndUpperPrimary', label: 'Primary & Upper Primary' },
          { value: 'PrimaryOnly', label: 'Primary Only' },
          { value: 'SecondaryAndHigherSecondary', label: 'Secondary & Higher Secondary' },
          { value: 'SecondaryOnly', label: 'Secondary Only' },
          { value: 'Total', label: 'Total' },
          { value: 'UpperPrimaryAndSecondary', label: 'Upper Primary & Secondary' },
          { value: 'UpperPrimaryOnly', label: 'Upper Primary Only' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Teachers_GovernmentAided_HigherSecondaryOnly_Total',
      'UDISE_Teachers_GovernmentAided_PrePrimaryAndPrimary_Total',
      'UDISE_Teachers_GovernmentAided_PrePrimaryOnly_Total',
      'UDISE_Teachers_GovernmentAided_PrimaryAndUpperPrimary_Total',
      'UDISE_Teachers_GovernmentAided_PrimaryOnly_Total',
      'UDISE_Teachers_GovernmentAided_SecondaryAndHigherSecondary_Total',
      'UDISE_Teachers_GovernmentAided_SecondaryOnly_Total',
      'UDISE_Teachers_GovernmentAided_Total_Total',
      'UDISE_Teachers_GovernmentAided_UpperPrimaryAndSecondary_Total',
      'UDISE_Teachers_GovernmentAided_UpperPrimaryOnly_Total',
      'UDISE_Teachers_Government_HigherSecondaryOnly_Total',
      'UDISE_Teachers_Government_PrePrimaryAndPrimary_Total',
      'UDISE_Teachers_Government_PrePrimaryOnly_Total',
      'UDISE_Teachers_Government_PrimaryAndUpperPrimary_Total',
      'UDISE_Teachers_Government_PrimaryOnly_Total',
      'UDISE_Teachers_Government_SecondaryAndHigherSecondary_Total',
      'UDISE_Teachers_Government_SecondaryOnly_Total',
      'UDISE_Teachers_Government_Total_Total',
      'UDISE_Teachers_Government_UpperPrimaryAndSecondary_Total',
      'UDISE_Teachers_Government_UpperPrimaryOnly_Total',
      'UDISE_Teachers_Others_HigherSecondaryOnly_Total',
      'UDISE_Teachers_Others_PrePrimaryAndPrimary_Total',
      'UDISE_Teachers_Others_PrePrimaryOnly_Total',
      'UDISE_Teachers_Others_PrimaryAndUpperPrimary_Total',
      'UDISE_Teachers_Others_PrimaryOnly_Total',
      'UDISE_Teachers_Others_SecondaryAndHigherSecondary_Total',
      'UDISE_Teachers_Others_SecondaryOnly_Total',
      'UDISE_Teachers_Others_Total_Total',
      'UDISE_Teachers_Others_UpperPrimaryAndSecondary_Total',
      'UDISE_Teachers_Others_UpperPrimaryOnly_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_HigherSecondaryOnly_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_PrePrimaryAndPrimary_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_PrePrimaryOnly_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_PrimaryAndUpperPrimary_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_PrimaryOnly_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_SecondaryAndHigherSecondary_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_SecondaryOnly_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_Total_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_UpperPrimaryAndSecondary_Total',
      'UDISE_Teachers_PrivateUnaidedRecognized_UpperPrimaryOnly_Total',
      'UDISE_Teachers_Total_HigherSecondaryOnly_Total',
      'UDISE_Teachers_Total_PrePrimaryAndPrimary_Total',
      'UDISE_Teachers_Total_PrePrimaryOnly_Total',
      'UDISE_Teachers_Total_PrimaryAndUpperPrimary_Total',
      'UDISE_Teachers_Total_PrimaryOnly_Total',
      'UDISE_Teachers_Total_SecondaryAndHigherSecondary_Total',
      'UDISE_Teachers_Total_SecondaryOnly_Total',
      'UDISE_Teachers_Total_Total_Total',
      'UDISE_Teachers_Total_UpperPrimaryAndSecondary_Total',
      'UDISE_Teachers_Total_UpperPrimaryOnly_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const management = filters.management || 'Total';
      const classesTaught = filters.classesTaught || 'Total';
      return [`UDISE_Teachers_${management}_${classesTaught}_Total`];
    },
    views: [
      { chartType: 'stackedBar', label: 'Stacked Bar', colorByLabel: 'Gender', filters: [{ filterId: 'management', multiSelect: false }, { filterId: 'classesTaught', multiSelect: false }] },
      { chartType: 'pie', label: 'Pie', colorByLabel: 'Gender', filters: [{ filterId: 'classesTaught', multiSelect: false }, { filterId: 'management', multiSelect: false }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'classesTaught', multiSelect: false }, { filterId: 'management', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 37. UDISE - Percentage Share of Teachers by School Category
  // ---------------------------------------------------------------------------
  {
    id: 'udise_teachers_share_by_category',
    name: 'Percentage Share of Teachers by School Category',
    dataset: 'UDISE',
    chartType: 'bar',
    filters: [
      {
        id: 'level',
        label: 'School Category',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
    ],
    statVars: [
      'UDISE_Teachers_Share_HigherSecondary',
      'UDISE_Teachers_Share_Primary',
      'UDISE_Teachers_Share_Secondary',
      'UDISE_Teachers_Share_UpperPrimary',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Primary';
      return [`UDISE_Teachers_Share_${level}`];
    },
    views: [
      { chartType: 'treemap', label: 'Treemap', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: false }] },
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'level', multiSelect: true }] },
      { chartType: 'line', label: 'Line', colorByLabel: 'Level of Education', filters: [{ filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 38. UDISE - Pupil Teacher Ratio (overall)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_ptr',
    name: 'Pupil Teacher Ratio',
    dataset: 'UDISE',
    chartType: 'bar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'Overall', label: 'Overall' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Overall',
      },
    ],
    statVars: [
      'UDISE_PupilTeacherRatio_HigherSecondary',
      'UDISE_PupilTeacherRatio_Overall',
      'UDISE_PupilTeacherRatio_Primary',
      'UDISE_PupilTeacherRatio_Secondary',
      'UDISE_PupilTeacherRatio_UpperPrimary',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Overall';
      return [`UDISE_PupilTeacherRatio_${level}`];
    },
    views: [
      { chartType: 'lollipop', label: 'Lollipop', filters: [] },
      { chartType: 'line', label: 'Line', filters: [] },
      { chartType: 'bar', label: 'Bar', filters: [] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 39. UDISE - Educational Parameters by Management (schools & teachers)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_edu_params_schools_teachers',
    name: 'Details on Educational Parameters by Management- number of schools, Number of teachers',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'metric',
        label: 'Metric',
        options: [
          { value: 'SchoolsCount', label: 'Number of Schools' },
          { value: 'TeachersCount', label: 'Number of Teachers' },
        ],
        defaultValue: 'SchoolsCount',
      },
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_EduParams_SchoolsCount_GovernmentAided',
      'UDISE_EduParams_SchoolsCount_Others',
      'UDISE_EduParams_SchoolsCount_PrivateUnaidedRecognized',
      'UDISE_EduParams_SchoolsCount_Total',
      'UDISE_EduParams_TeachersCount_GovernmentAided',
      'UDISE_EduParams_TeachersCount_Others',
      'UDISE_EduParams_TeachersCount_PrivateUnaidedRecognized',
      'UDISE_EduParams_TeachersCount_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const metric = filters.metric || 'SchoolsCount';
      const management = filters.management || 'Total';
      return [`UDISE_EduParams_${metric}_${management}`];
    },
    views: [
      { chartType: 'area', label: 'Area', filters: [{ filterId: 'management', multiSelect: false }, { filterId: 'metric', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'management', multiSelect: true }, { filterId: 'metric', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'metric', multiSelect: true }, { filterId: 'management', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 40. UDISE - Educational Parameters: Facilities (electricity, toilets, etc.)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_edu_params_facilities',
    name: 'Details on Educational Parameters by Management- Percent of Schools having functional electricity, Functional toilets, Functional Toilets- Girls & Boys, Functional CWSN friendly toilets, Kitchen Garden, Solar Panel',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'HigherSecondary', label: 'Higher Secondary' },
          { value: 'PrePrimary', label: 'Pre-Primary' },
          { value: 'PrimaryToHigherSecondary', label: 'Primary to Higher Secondary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Total', label: 'Total' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_Enrolment_CWSN_Elementary_Boys',
      'UDISE_Enrolment_CWSN_Elementary_Girls',
      'UDISE_Enrolment_CWSN_Elementary_Total',
      'UDISE_Enrolment_CWSN_HigherSecondary_Boys',
      'UDISE_Enrolment_CWSN_HigherSecondary_Girls',
      'UDISE_Enrolment_CWSN_HigherSecondary_Total',
      'UDISE_Enrolment_CWSN_PrePrimary_Boys',
      'UDISE_Enrolment_CWSN_PrePrimary_Girls',
      'UDISE_Enrolment_CWSN_PrePrimary_Total',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Boys',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Girls',
      'UDISE_Enrolment_CWSN_PrimaryToHigherSecondary_Total',
      'UDISE_Enrolment_CWSN_Primary_Boys',
      'UDISE_Enrolment_CWSN_Primary_Girls',
      'UDISE_Enrolment_CWSN_Primary_Total',
      'UDISE_Enrolment_CWSN_Secondary_Boys',
      'UDISE_Enrolment_CWSN_Secondary_Girls',
      'UDISE_Enrolment_CWSN_Secondary_Total',
      'UDISE_Enrolment_CWSN_Total_Boys',
      'UDISE_Enrolment_CWSN_Total_Girls',
      'UDISE_Enrolment_CWSN_Total_Total',
      'UDISE_Enrolment_CWSN_UpperPrimary_Boys',
      'UDISE_Enrolment_CWSN_UpperPrimary_Girls',
      'UDISE_Enrolment_CWSN_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const level = filters.level || 'Total';
      const gender = filters.gender || 'Total';
      return [`UDISE_Enrolment_CWSN_${level}_${gender}`];
    },
    views: [
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'level', multiSelect: false }, { filterId: 'gender', multiSelect: false }] },
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'level', multiSelect: true }, { filterId: 'gender', multiSelect: false }] },
      { chartType: 'bar', label: 'Column', filters: [{ filterId: 'level', multiSelect: true }, { filterId: 'gender', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 41. UDISE - Total number of Schools
  // ---------------------------------------------------------------------------
  {
    id: 'udise_total_schools',
    name: 'Total number of School',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [],
    statVars: ['UDISE_Schools_Count'],
    resolveStatVars: singleStatVar('UDISE_Schools_Count'),
    views: [
      { chartType: 'area', label: 'Area', filters: [] },
      { chartType: 'lollipop', label: 'Lollipop', filters: [] },
      { chartType: 'line', label: 'Line', filters: [] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 42. UDISE - Number of Schools having infrastructure facility
  // ---------------------------------------------------------------------------
  {
    id: 'udise_schools_infrastructure',
    name: 'Number of Schools having infrastructure facility',
    dataset: 'UDISE',
    chartType: 'bar',
    filters: [
      {
        id: 'facility',
        label: 'Infrastructure Facility',
        options: [
          { value: 'WithBoysToilet', label: 'Boys Toilet' },
          { value: 'WithComputerFacility', label: 'Computer Facility' },
          { value: 'WithDigitalLibrary', label: 'Digital Library' },
          { value: 'WithDrinkingWater', label: 'Drinking Water' },
          { value: 'WithElectricity', label: 'Electricity' },
          { value: 'WithFunctionalBoysToilet', label: 'Functional Boys Toilet' },
          { value: 'WithFunctionalComputerFacilityForPedagogicalPurposes', label: 'Functional Computer (Pedagogical)' },
          { value: 'WithFunctionalDrinkingWater', label: 'Functional Drinking Water' },
          { value: 'WithFunctionalElectricity', label: 'Functional Electricity' },
          { value: 'WithFunctionalGirlsToilet', label: 'Functional Girls Toilet' },
          { value: 'WithGirlsToilet', label: 'Girls Toilet' },
          { value: 'WithHandWashFacility', label: 'Hand Wash Facility' },
          { value: 'WithInternetFacility', label: 'Internet Facility' },
          { value: 'WithKitchenGarden', label: 'Kitchen Garden' },
          { value: 'WithLibraryBookBankReadingCorner', label: 'Library/Book Bank/Reading Corner' },
          { value: 'WithPlayground', label: 'Playground' },
          { value: 'WithRamp', label: 'Ramp' },
          { value: 'WithRampAndHandrails', label: 'Ramp and Handrails' },
          { value: 'WithSchoolsWithCwsnToiletFacilities', label: 'CWSN Toilet Facilities' },
          { value: 'WithSolarPanel', label: 'Solar Panel' },
        ],
        defaultValue: 'WithElectricity',
      },
    ],
    statVars: [
      'UDISE_Schools_WithBoysToilet',
      'UDISE_Schools_WithComputerFacility',
      'UDISE_Schools_WithDigitalLibrary',
      'UDISE_Schools_WithDrinkingWater',
      'UDISE_Schools_WithElectricity',
      'UDISE_Schools_WithFunctionalBoysToilet',
      'UDISE_Schools_WithFunctionalComputerFacilityForPedagogicalPurposes',
      'UDISE_Schools_WithFunctionalDrinkingWater',
      'UDISE_Schools_WithFunctionalElectricity',
      'UDISE_Schools_WithFunctionalGirlsToilet',
      'UDISE_Schools_WithGirlsToilet',
      'UDISE_Schools_WithHandWashFacility',
      'UDISE_Schools_WithInternetFacility',
      'UDISE_Schools_WithKitchenGarden',
      'UDISE_Schools_WithLibraryBookBankReadingCorner',
      'UDISE_Schools_WithPlayground',
      'UDISE_Schools_WithRamp',
      'UDISE_Schools_WithRampAndHandrails',
      'UDISE_Schools_WithSchoolsWithCwsnToiletFacilities',
      'UDISE_Schools_WithSolarPanel',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const facility = filters.facility || 'WithElectricity';
      return [`UDISE_Schools_${facility}`];
    },
    views: [
      { chartType: 'bar', label: 'Bar', filters: [{ filterId: 'facility', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'facility', multiSelect: true }] },
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'facility', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 43. UDISE - Educational Parameters: Enrolment by management & gender
  // ---------------------------------------------------------------------------
  {
    id: 'udise_edu_params_enrolment',
    name: 'Details on Educational Parameters by Management- total enrollment, Enrollment (Girls), Enrollment (Boys)',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Female', label: 'Female (Girls)' },
          { value: 'Male', label: 'Male (Boys)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
      {
        id: 'management',
        label: 'Management',
        options: [
          { value: 'GovernmentAided', label: 'Government Aided' },
          { value: 'Others', label: 'Others' },
          { value: 'PrivateUnaidedRecognized', label: 'Private Unaided (Recognized)' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_EduParams_Enrolment_Female_GovernmentAided',
      'UDISE_EduParams_Enrolment_Female_Others',
      'UDISE_EduParams_Enrolment_Female_PrivateUnaidedRecognized',
      'UDISE_EduParams_Enrolment_Female_Total',
      'UDISE_EduParams_Enrolment_Male_GovernmentAided',
      'UDISE_EduParams_Enrolment_Male_Others',
      'UDISE_EduParams_Enrolment_Male_PrivateUnaidedRecognized',
      'UDISE_EduParams_Enrolment_Male_Total',
      'UDISE_EduParams_Enrolment_Total_GovernmentAided',
      'UDISE_EduParams_Enrolment_Total_Others',
      'UDISE_EduParams_Enrolment_Total_PrivateUnaidedRecognized',
      'UDISE_EduParams_Enrolment_Total_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const gender = filters.gender || 'Total';
      const management = filters.management || 'Total';
      return [`UDISE_EduParams_Enrolment_${gender}_${management}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'management', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'management', multiSelect: false }] },
      { chartType: 'heatmap', label: 'Heatmap', colorByLabel: 'Management', filters: [{ filterId: 'gender', multiSelect: false }] },
    ],
    source: UDISE_SOURCE,
  },

  // ---------------------------------------------------------------------------
  // 44. UDISE - Adjusted Net Enrolment Rate (ANER)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_aner',
    name: 'Adjusted Net Enrolment Rate (ANER)',
    dataset: 'UDISE',
    chartType: 'line',
    filters: [
      {
        id: 'metric',
        label: 'Metric',
        options: [
          { value: 'ANER', label: 'Adjusted NER (ANER)' },
          { value: 'NER', label: 'Net Enrolment Rate (NER)' },
        ],
        defaultValue: 'ANER',
      },
      {
        id: 'level',
        label: 'Education Level',
        options: [
          { value: 'Elementary', label: 'Elementary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'UpperPrimary', label: 'Upper Primary' },
        ],
        defaultValue: 'Primary',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_ANER_Elementary_Boys',
      'UDISE_ANER_Elementary_Girls',
      'UDISE_ANER_Elementary_Total',
      'UDISE_ANER_Primary_Boys',
      'UDISE_ANER_Primary_Girls',
      'UDISE_ANER_Primary_Total',
      'UDISE_ANER_Secondary_Boys',
      'UDISE_ANER_Secondary_Girls',
      'UDISE_ANER_Secondary_Total',
      'UDISE_ANER_UpperPrimary_Boys',
      'UDISE_ANER_UpperPrimary_Girls',
      'UDISE_ANER_UpperPrimary_Total',
      'UDISE_NER_Elementary_Boys',
      'UDISE_NER_Elementary_Girls',
      'UDISE_NER_Elementary_Total',
      'UDISE_NER_HigherSecondary_Boys',
      'UDISE_NER_HigherSecondary_Girls',
      'UDISE_NER_HigherSecondary_Total',
      'UDISE_NER_Primary_Boys',
      'UDISE_NER_Primary_Girls',
      'UDISE_NER_Primary_Total',
      'UDISE_NER_Secondary_Boys',
      'UDISE_NER_Secondary_Girls',
      'UDISE_NER_Secondary_Total',
      'UDISE_NER_UpperPrimary_Boys',
      'UDISE_NER_UpperPrimary_Girls',
      'UDISE_NER_UpperPrimary_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const metric = filters.metric || 'ANER';
      const level = filters.level || 'Primary';
      const gender = filters.gender || 'Total';
      return [`UDISE_${metric}_${level}_${gender}`];
    },
    views: [
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: false }] },
      { chartType: 'lollipop', label: 'Lollipop', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'level', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },

  // ---------------------------------------------------------------------------
  // 45. UDISE - Age-Specific Enrolment Rate (ASER)
  // ---------------------------------------------------------------------------
  {
    id: 'udise_aser',
    name: 'Age-Specific Enrolment Rate (ASER)',
    dataset: 'UDISE',
    chartType: 'groupedBar',
    filters: [
      {
        id: 'ageGroup',
        label: 'Age Group',
        options: [
          { value: '610Years', label: '6-10 Years' },
          { value: '613Years', label: '6-13 Years' },
          { value: '1113Years', label: '11-13 Years' },
          { value: '1415Years', label: '14-15 Years' },
          { value: '1617Years', label: '16-17 Years' },
        ],
        defaultValue: '610Years',
      },
      {
        id: 'gender',
        label: 'Gender',
        options: [
          { value: 'Boys', label: 'Boys' },
          { value: 'Girls', label: 'Girls' },
          { value: 'Total', label: 'Total' },
        ],
        defaultValue: 'Total',
      },
    ],
    statVars: [
      'UDISE_ASER_1113Years_Boys',
      'UDISE_ASER_1113Years_Girls',
      'UDISE_ASER_1113Years_Total',
      'UDISE_ASER_1415Years_Boys',
      'UDISE_ASER_1415Years_Girls',
      'UDISE_ASER_1415Years_Total',
      'UDISE_ASER_1617Years_Boys',
      'UDISE_ASER_1617Years_Girls',
      'UDISE_ASER_1617Years_Total',
      'UDISE_ASER_610Years_Boys',
      'UDISE_ASER_610Years_Girls',
      'UDISE_ASER_610Years_Total',
      'UDISE_ASER_613Years_Boys',
      'UDISE_ASER_613Years_Girls',
      'UDISE_ASER_613Years_Total',
    ],
    resolveStatVars: (filters: FilterState): string[] => {
      const ageGroup = filters.ageGroup || '610Years';
      const gender = filters.gender || 'Total';
      return [`UDISE_ASER_${ageGroup}_${gender}`];
    },
    views: [
      { chartType: 'groupedBar', label: 'Grouped Bar', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'ageGroup', multiSelect: true }] },
      { chartType: 'line', label: 'Line', filters: [{ filterId: 'ageGroup', multiSelect: true }, { filterId: 'gender', multiSelect: false }] },
      { chartType: 'groupedBar', label: 'Bar Graph', filters: [{ filterId: 'gender', multiSelect: true }, { filterId: 'ageGroup', multiSelect: true }] },
    ],
    source: UDISE_SOURCE,
    unit: '%',
  },
];

// ===== Lookup helpers =====

/** Map of indicator id to IndicatorConfig for O(1) lookup */
export const INDICATOR_MAP: Record<string, IndicatorConfig> = Object.fromEntries(
  INDICATORS.map((ind) => [ind.id, ind])
);

/** Get all indicators for a given dataset */
export function getIndicatorsByDataset(dataset: IndicatorConfig['dataset']): IndicatorConfig[] {
  return INDICATORS.filter((ind) => ind.dataset === dataset);
}

/** Get a single indicator by id */
export function getIndicatorById(id: string): IndicatorConfig | undefined {
  return INDICATOR_MAP[id];
}
