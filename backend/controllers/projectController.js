const {
    createProject,
    getUserProjects,
    getProjectById,
    deleteProject,
} = require("../services/projectService");

/*
|--------------------------------------------------------------------------
| Create Project
|--------------------------------------------------------------------------
*/

const create = async (req, res) => {
    console.log("CREATE CONTROLLER CALLED");
    try {
        const {
            name,
            description,
            sourceType,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Uploaded Files
        |--------------------------------------------------------------------------
        |
        | Multer places all uploaded files inside req.files
        | because we are using upload.array("codeFiles").
        |
        */

        const files = req.files || [];

        console.log(
            `Controller received ${files.length} files`
        );

        /*
        |--------------------------------------------------------------------------
        | Create Project + Analyze Files
        |--------------------------------------------------------------------------
        */

        const project = await createProject(
            req.user.userId,
            {
                name: name.trim(),
                description:
                    description || "",
                sourceType:
                    sourceType || "upload",
            },
            files
        );

        res.status(201).json({
            message:
                "Project created successfully",
            project,
        });
    } catch (error) {
        console.error(
            "Create project error:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
                "Failed to create project",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All Projects
|--------------------------------------------------------------------------
*/

const getAll = async (req, res) => {
    try {
        const projects =
            await getUserProjects(
                req.user.userId
            );

        res.status(200).json({
            projects,
        });
    } catch (error) {
        console.error(
            "Get projects error:",
            error
        );

        res.status(500).json({
            message:
                error.message ||
                "Failed to fetch projects",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Single Project
|--------------------------------------------------------------------------
*/

const getOne = async (req, res) => {
    try {
        const project =
            await getProjectById(
                req.params.id,
                req.user.userId
            );

        res.status(200).json({
            project,
        });
    } catch (error) {
        console.error(
            "Get project error:",
            error
        );

        res.status(404).json({
            message:
                error.message ||
                "Project not found",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Project
|--------------------------------------------------------------------------
*/

const remove = async (req, res) => {
    try {
        await deleteProject(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            message:
                "Project deleted successfully",
        });
    } catch (error) {
        console.error(
            "Delete project error:",
            error
        );

        res.status(404).json({
            message:
                error.message ||
                "Project not found",
        });
    }
};

module.exports = {
    create,
    getAll,
    getOne,
    remove,
};