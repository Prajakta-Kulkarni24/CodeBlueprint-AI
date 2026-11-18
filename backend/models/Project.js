
const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Uploaded File Schema
|--------------------------------------------------------------------------
*/

const projectFileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true,
            trim: true
        },

        storedName: {
            type: String,
            default: ""
        },

        path: {
            type: String,
            default: ""
        },

        extension: {
            type: String,
            default: "",
            lowercase: true
        },

        language: {
            type: String,
            default: "Unknown",
            trim: true
        },

        type: {
            type: String,
            enum: ["source", "asset", "other"],
            default: "source"
        },

        lines: {
            type: Number,
            default: 0,
            min: 0
        },

        size: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        _id: false
    }
);

/*
|--------------------------------------------------------------------------
| Project Schema
|--------------------------------------------------------------------------
*/

const projectSchema = new mongoose.Schema(
    {
        /*
        |--------------------------------------------------------------------------
        | Owner
        |--------------------------------------------------------------------------
        */

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        /*
        |--------------------------------------------------------------------------
        | Basic Project Information
        |--------------------------------------------------------------------------
        */

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000
        },

        sourceType: {
            type: String,
            enum: ["upload", "github"],
            default: "upload"
        },

        /*
        |--------------------------------------------------------------------------
        | Project Summary Information
        |--------------------------------------------------------------------------
        | These fields are used by Projects, Dashboard and Project Overview.
        |--------------------------------------------------------------------------
        */

        language: {
            type: String,
            default: "Unknown",
            trim: true
        },

        fileCount: {
            type: Number,
            default: 0,
            min: 0
        },

        codeLines: {
            type: Number,
            default: 0,
            min: 0
        },

        /*
        |--------------------------------------------------------------------------
        | Code Quality and Security
        |--------------------------------------------------------------------------
        */

        securityIssues: {
            type: Number,
            default: 0,
            min: 0
        },

        technicalDebtScore: {
            type: Number,
            default: 0,
            min: 0
        },

        /*
        |--------------------------------------------------------------------------
        | Processing Status
        |--------------------------------------------------------------------------
        */

        status: {
            type: String,
            enum: [
                "created",
                "analyzing",
                "completed",
                "failed"
            ],
            default: "created"
        },

        /*
        |--------------------------------------------------------------------------
        | Uploaded Files
        |--------------------------------------------------------------------------
        */

        files: {
            type: [projectFileSchema],
            default: []
        },

        /*
        |--------------------------------------------------------------------------
        | Analysis Information
        |--------------------------------------------------------------------------
        | Mixed type preserves the complete analyzer output, including
        | language counts, metrics, security findings and architecture.
        |--------------------------------------------------------------------------
        */

        analysis: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({
                languageCounts: {},
                codeFileCount: 0,
                assetFileCount: 0,
                totalLines: 0,
                nonEmptyLines: 0,
                commentLines: 0,
                architecture: {
                    type: "codebase",
                    nodes: [],
                    edges: [],
                    dependencies: []
                },
                dependencies: []
            })
        },

        /*
        |--------------------------------------------------------------------------
        | Architecture Diagram
        |--------------------------------------------------------------------------
        */

        architectureDiagram: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

// Efficiently retrieve a user's projects, newest first.
projectSchema.index({
    user: 1,
    createdAt: -1
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

module.exports =
    mongoose.models.Project ||
    mongoose.model("Project", projectSchema);
