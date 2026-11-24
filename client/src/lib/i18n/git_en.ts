export const GIT_GUIDE_EN = {
  headerTitle: "Git & GitHub Protocol",
  headerSubtitle: "Mainframe Synchronization",
  introTitle: "The Code Time Machine",
  introBodyPrefix: "In the hacker world, losing a script is fatal. ",
  introBodyGit: "Git",
  introBodyMid:
    " is your temporal backup system, letting you save versions of your code and go back in time if something goes wrong. ",
  introBodyGitHub: "GitHub",
  introBodySuffix:
    " is the global mainframe where you store those backups and collaborate with other operators.",
  whatIsGitTitle: "What is Git?",
  whatIsGitDesc:
    'It is a program installed in your terminal (local computer). It creates a "snapshot" of your project every time you make an important change.',
  whatIsGitBadge: "No internet needed • Runs on your PC • Command line",
  whatIsGitHubTitle: "What is GitHub?",
  whatIsGitHubDesc:
    "It is a website (cloud) that hosts your Git repositories. It serves as a portfolio to showcase your projects to companies and other developers.",
  whatIsGitHubBadge: "Requires internet • Hosting • Dev Social Network",
  commandsHeading: "Infiltration Commands (Basic Flow)",
  steps: [
    {
      cmd: "git init",
      title: "Initialize Repository",
      desc: "Turns a regular folder on your PC into a vault tracked by Git.",
    },
    {
      cmd: "git add .",
      title: "Add to Stage (Staging)",
      desc: "Tells Git which modified files you want to include in the next snapshot.",
    },
    {
      cmd: 'git commit -m "message"',
      title: "Take the Snapshot (Commit)",
      desc: "Permanently saves the state of your files with a message describing what you did.",
    },
    {
      cmd: "git push origin main",
      title: "Send to Mainframe (Push)",
      desc: "Uploads your local commits to the GitHub cloud.",
    },
  ],
  nextStepsTitle: "Next Steps",
  nextStepsPrefix: "To get started, create a free account at ",
  nextStepsMid: ", download ",
  nextStepsSuffix:
    " in your terminal, and start saving your Python Quest scripts in the cloud!",
  openSimulatorBtn: "Open Simulator",
} as const;

export const GIT_CODEX_EN = {
  tabs: {
    concepts: "Git Architecture",
    basics: "Lifecycle",
    branching: "Branching Flow",
    remote: "Synchronization",
    undoing: "Time Travel",
    config: "Identity Signal",
    best_practices: "Clean Protocol",
  },
  tabDescriptions: {
    basics:
      "Fundamental commands to start tracking your project and save your local progress.",
    branching:
      "Create alternate timelines. Work on isolated features without corrupting the main core (main).",
    remote:
      "Connect your machine to the global network. Collaborate with other operators and keep cloud backups.",
    undoing:
      "The power to fix the past. Rescue deleted files or undo wrong decisions with precision.",
    config:
      "Customize your cryptographic signature and adjust how the Git tool behaves.",
  },
  rituals: {
    basics: [
      {
        title: "git init",
        desc: "Initializes a new local repository. Creates the hidden .git folder where the magic happens.",
        code: "git init",
      },
      {
        title: "git status",
        desc: "Checks the current state of your Working Directory and Staging Area.",
        code: "git status",
      },
      {
        title: "git add",
        desc: "Stages files for the next commit. Moves changes from Working Dir to the Staging Area.",
        code: "git add .\n# or\ngit add index.html",
      },
      {
        title: "git commit",
        desc: "Records a permanent snapshot of your project in history.",
        code: 'git commit -m "feat: add login system"',
      },
      {
        title: "git log",
        desc: "Displays the timeline of all commits made in the repository.",
        code: "git log --oneline --graph --all",
      },
    ],
    branching: [
      {
        title: "git branch",
        desc: "Lists all local branches or creates a new one without leaving the current branch.",
        code: "git branch feature-x",
      },
      {
        title: "git checkout",
        desc: "Switches branches or restores files from the working tree.",
        code: "git checkout main",
      },
      {
        title: "git switch",
        desc: "A modern and more intuitive alternative to checkout for switching branches.",
        code: "git switch feature-ui",
      },
      {
        title: "git merge",
        desc: "Merges the history of another branch into your current branch.",
        code: "git merge feature-x",
      },
      {
        title: "git checkout -b",
        desc: "Creates a new branch and switches to it immediately.",
        code: "git checkout -b fix-bug",
      },
    ],
    remote: [
      {
        title: "git remote add",
        desc: "Connects your local repository to a remote server (e.g., GitHub).",
        code: "git remote add origin https://github.com/user/repo.git",
      },
      {
        title: "git push",
        desc: "Uploads your local commits to the remote server.",
        code: "git push origin main",
      },
      {
        title: "git pull",
        desc: "Downloads changes from the remote and tries to merge them into your local branch.",
        code: "git pull origin main",
      },
      {
        title: "git fetch",
        desc: "Downloads data from the remote without changing your local code. Safe for inspection.",
        code: "git fetch origin",
      },
      {
        title: "git clone",
        desc: "Creates an identical copy of a remote repository on your machine.",
        code: "git clone https://github.com/user/repo.git",
      },
    ],
    undoing: [
      {
        title: "git restore",
        desc: "Discards uncommitted changes in a file, reverting it to the last saved state.",
        code: "git restore index.html",
      },
      {
        title: "git reset --soft",
        desc: "Undoes the last commit while keeping the changes in your Staging Area.",
        code: "git reset --soft HEAD~1",
      },
      {
        title: "git reset --hard",
        desc: "DANGER: Erases the last commit and all unsaved changes. No going back.",
        code: "git reset --hard HEAD~1",
      },
      {
        title: "git revert",
        desc: "Creates a new commit that cleanly undoes what a previous commit did.",
        code: "git revert abc1234",
      },
      {
        title: "git stash",
        desc: "Temporarily saves your changes in a stack to clean up the working directory.",
        code: "git stash\n# ... later ...\ngit stash pop",
      },
    ],
    config: [
      {
        title: "git config user.name",
        desc: "Sets the name that will appear on your commits.",
        code: 'git config --global user.name "Your Name"',
      },
      {
        title: "git config user.email",
        desc: "Sets the email linked to your commits in history.",
        code: 'git config --global user.email "you@email.com"',
      },
      {
        title: "git config --list",
        desc: "Lists all active settings in your Git environment.",
        code: "git config --list",
      },
      {
        title: "git show",
        desc: "Displays details and specific changes of a commit or object.",
        code: "git show HEAD",
      },
    ],
  },
  copyToast: "Command copied to clipboard.",
  conceptsTitle: "The Time Machine",
  conceptsIntroPrefix: "Git is not just a backup system. It is a ",
  conceptsIntroHighlight: "snapshot infrastructure",
  conceptsIntroSuffix:
    " that lets you branch the reality of code and merge parallel universes without losing a single bit.",
  threeAreasHeading: "The 3 Fundamental Areas",
  areas: {
    workingDirTitle: "Working Directory",
    workingDirDesc:
      'Where you edit your files. It is your "dirty" workspace not yet committed to Git.',
    stagingTitle: "Staging Area",
    stagingDesc:
      "The waiting room. Here you choose which changes will be included in the next snapshot.",
    repoTitle: "Repository (.git)",
    repoDesc:
      "Where Git permanently stores snapshots (commits) and history.",
  },
  conflictAlertTitle: "Conflict Alert",
  conflictAlertQuote:
    '"A messy history is worse than a bug. It hides the truth of the system."',
  conflictAlertPre: "Never use ",
  conflictAlertPost:
    " on shared branches. It rewrites reality for other operators and causes chaos across the network.",
  commitProtocolsTitle: "Commit Protocols",
  protocols: {
    atomicTitle: "Atomic Commits",
    atomicPre: "Make small, focused commits. Each commit should solve only ",
    atomicHighlight: "one thing",
    atomicPost: ". This makes it easy to revert if something breaks.",
    imperativeTitle: "Imperative Messages",
    imperativeDesc:
      'Write like a command: "Add login feature" instead of "Added login". Git treats your commit messages as instructions applied to history.',
    gitignoreTitle: "The .gitignore File",
    gitignorePre:
      "Never commit passwords, heavy binary files, or dependency folders (node_modules). Use a ",
    gitignorePost: " file to filter out the noise.",
  },
  injectBtn: "Inject",
  openSourceLabel: "Open Source Protocol",
  memorySnapshotLabel: "Memory Snapshot",
  closeManualBtn: "Close Manual",
} as const;

export const GIT_SIM_LEVELS_EN: Record<
  number,
  {
    title: string;
    briefing: string;
    missions: Record<string, { title: string; hint: string }>;
  }
> = {
  1: {
    title: "Basic Workflow",
    briefing:
      "Learn the essential cycle: initialize a repository, stage files, commit, and push to GitHub.",
    missions: {
      init: { title: "Initialize the repository", hint: "git init" },
      config: {
        title:
          "Configure your identity (name and email) — Git requires this before the first commit",
        hint: 'git config user.name "Your Name" and then git config user.email "you@example.com"',
      },
      add: { title: "Stage all files", hint: "git add ." },
      commit: {
        title: "Make the first commit",
        hint: 'git commit -m "first commit"',
      },
      remote: {
        title: "Connect to the remote GitHub repo",
        hint: "git remote add origin <url>",
      },
      push: { title: "Push to GitHub", hint: "git push origin main" },
    },
  },
  2: {
    title: "Branches & Merge",
    briefing:
      "Create a branch for a feature, make commits on it, and merge it back into main without conflicts.",
    missions: {
      branch: {
        title: "Create and switch to the 'feature' branch",
        hint: "git checkout -b feature",
      },
      edit: {
        title: "Edit main.py (click the file) and commit on feature",
        hint: 'Edit the file, then: git add . && git commit -m "new feature"',
      },
      merge: {
        title: "Switch back to main and merge feature",
        hint: "git checkout main && git merge feature",
      },
    },
  },
  3: {
    title: "Resolving Conflicts",
    briefing:
      "Two branches modified the same line. Attempt the merge, resolve the conflict by editing the file, and finish the commit.",
    missions: {
      merge: {
        title: "Try: git merge hotfix (it will conflict!)",
        hint: "git merge hotfix",
      },
      resolve: {
        title:
          "Edit config.py and remove the <<<<<<< ======= >>>>>>> markers",
        hint: "Click config.py, keep the right version, and save.",
      },
      complete: {
        title: "Finish up: git add . && git commit",
        hint: 'git add . && git commit -m "merge hotfix"',
      },
    },
  },
  4: {
    title: "Remote Workflow",
    briefing:
      "A teammate pushed commits to the remote. Sync with pull, then push your changes.",
    missions: {
      pull: {
        title: "Sync with the remote: git pull",
        hint: "git pull origin main",
      },
      push: {
        title: "Push everything to GitHub: git push",
        hint: "git push origin main",
      },
    },
  },
  5: {
    title: "Undoing Changes",
    briefing:
      "Learn how to travel back in time: discard local changes with restore, reset commits with reset, and undo safely without rewriting history using revert.",
    missions: {
      restore: {
        title: "Discard the dirty change: git restore app.js",
        hint: "git restore app.js",
      },
      revert: {
        title: "Revert the bad commit without erasing history: git revert HEAD",
        hint: "git revert HEAD (creates an undo commit)",
      },
    },
  },
};

export const GIT_SIM_HELP_EN = [
  "Supported commands:",
  "  git init                              initialize the repository",
  '  git config [--global] user.name|user.email "value"',
  "  git config --list                     show current configuration",
  "  git status                            show state of the 3 areas",
  "  git add <file>|.                      stage file(s) for commit",
  "  git commit -m <msg>                   double, single, or unquoted message",
  "  git log [--oneline|--graph|--all]",
  "  git diff                              compare working dir vs last commit",
  "  git restore <file>                    discard local changes",
  "  git revert <ref>                      create a commit that undoes another",
  "  git branch [name]                     list or create a branch",
  "  git checkout [-b]|switch [-c] <name>  switch or create a branch",
  "  git merge <branch>                    merge another branch into current",
  "  git reset --hard                      restore working dir to HEAD",
  "  git remote add origin <url>           connect to GitHub",
  "  git push|pull [origin <branch>]       sync with remote",
  "  git fetch                             download commits without applying",
  "  git stash | git stash pop             save/restore uncommitted work",
  "",
  "Accepted refs in any command: HEAD/head/Head, HEAD~N, HEAD^,",
  "                              full hash (7 chars) or prefix (4+)",
  "",
  "  clear | reset | help",
  "Shortcuts: ↑/↓ history  •  Tab contextual autocomplete  •  Click a file to edit",
  "",
  "⚠️ These commands only work inside this simulated environment.",
  "To use them on your PC, install real Git at git-scm.com.",
];
